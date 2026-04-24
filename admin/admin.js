document.addEventListener('DOMContentLoaded', () => {
    // Admin Login Logic
    const adminOverlay = document.getElementById('admin-login-overlay');
    const adminForm = document.getElementById('admin-login-form');
    const adminError = document.getElementById('admin-login-error');
    
    // Configurações de acesso restrito
    const ADMIN_EMAIL = 'admin@wandeath.com';
    const ADMIN_PASS = 'admin123';

    if (localStorage.getItem('wandeath_admin_logged') === 'true') {
        adminOverlay.style.display = 'none';
    }

    if (adminForm) {
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value;
            const pass = document.getElementById('admin-pass').value;

            if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
                localStorage.setItem('wandeath_admin_logged', 'true');
                adminOverlay.style.display = 'none';
            } else {
                adminError.style.display = 'block';
            }
        });
    }

    // Função para sair do admin
    window.adminLogout = function() {
        localStorage.removeItem('wandeath_admin_logged');
        window.location.reload();
    };

    // Ajusta o botão de voltar à loja para deslogar também do painel admin, se quiser.
    // Mas o mais seguro é adicionar um botão "Sair" ou apenas deixar o admin_logged persistente.
    // Vou substituir a ação do botão "Voltar à Loja" para fazer o logout do painel.
    const returnBtn = document.querySelector('.return-btn');
    if (returnBtn) {
        returnBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('wandeath_admin_logged');
            window.location.href = '../index.html';
        });
    }

    const chatMessages = document.getElementById('admin-chat-messages');
    const pageTitle = document.getElementById('page-title');
    const navItems = {
        'nav-dashboard': 'section-dashboard',
        'nav-chat': 'section-chat',
        'nav-products': 'section-products',
        'nav-coupons': 'section-coupons',
        'nav-customers': 'section-customers',
        'nav-settings': 'section-settings'
    };

    Object.keys(navItems).forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(id.replace('nav-', ''));
            });
        }
    });

    function showSection(sectionId) {
        // Update sidebar active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.id === `nav-${sectionId}`) item.classList.add('active');
        });

        // Update section visibility
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.style.display = 'none';
            sec.classList.remove('active');
        });

        const targetSection = document.getElementById(`section-${sectionId}`);
        if (targetSection) {
            targetSection.style.display = (sectionId === 'chat') ? 'flex' : 'block';
            setTimeout(() => targetSection.classList.add('active'), 10);
            
            const titles = {
                'dashboard': 'Dashboard Geral',
                'chat': 'Gestão de Atendimento',
                'products': 'Gerenciar Produtos',
                'coupons': 'Gerenciar Cupons',
                'customers': 'Gestão de Clientes',
                'settings': 'Configurações do Site'
            };
            pageTitle.textContent = titles[sectionId] || 'Painel Admin';

            if (sectionId === 'chat') renderAdminMessages();
            if (sectionId === 'products') renderAdminProducts();
            if (sectionId === 'coupons') renderAdminCoupons();
            if (sectionId === 'dashboard') animateMetrics();
        }
    }

    // Interactive Dashboard (Ticking numbers & Chart)
    function animateMetrics() {
        const metrics = document.querySelectorAll('.metric-card h3');
        metrics.forEach(metric => {
            const finalValue = metric.innerText;
            if (finalValue.includes('R$')) return;
            
            let current = 0;
            const target = parseInt(finalValue);
            const duration = 1500;
            const step = target / (duration / 30);
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    metric.innerText = target;
                    clearInterval(timer);
                } else {
                    metric.innerText = Math.floor(current);
                }
            }, 30);
        });

        const bars = document.querySelectorAll('.mock-chart .bar');
        bars.forEach((bar, index) => {
            const targetHeight = bar.getAttribute('data-value') + '%';
            bar.style.height = '0px';
            setTimeout(() => {
                bar.style.height = targetHeight;
            }, 100 + (index * 50));
        });
    }

    // Initial render
    showSection('dashboard');

    // ─── Chat Logic ───
    function renderAdminMessages() {
        const historyStr = localStorage.getItem('wandeath_chat_history');
        const history = historyStr ? JSON.parse(historyStr) : [];
        
        chatMessages.innerHTML = '';
        
        if (history.length === 0) {
            chatMessages.innerHTML = `
                <div style="text-align: center; color: var(--text-sec); margin-top: 50px;">
                    Nenhuma mensagem recebida ainda.
                </div>
            `;
            return;
        }

        history.forEach(msg => {
            const msgEl = document.createElement('div');
            msgEl.className = `chat-msg ${msg.sender}`;
            msgEl.textContent = msg.text;
            chatMessages.appendChild(msgEl);
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendAdminMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        const historyStr = localStorage.getItem('wandeath_chat_history');
        const history = historyStr ? JSON.parse(historyStr) : [];

        history.push({
            sender: 'admin',
            text: text,
            timestamp: Date.now()
        });

        localStorage.setItem('wandeath_chat_history', JSON.stringify(history));
        
        chatInput.value = '';
        renderAdminMessages();
    }

    sendBtn.addEventListener('click', sendAdminMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAdminMessage();
    });

    // ─── Products Logic ───
    const addProductBtn = document.getElementById('add-product-btn');
    const adminProductsList = document.getElementById('admin-products-list');

    function renderAdminProducts() {
        const productsStr = localStorage.getItem('wandeath_products');
        const products = productsStr ? JSON.parse(productsStr) : [];

        adminProductsList.innerHTML = '';

        if (products.length === 0) {
            adminProductsList.innerHTML = '<p style="color: var(--text-sec);">Nenhum produto cadastrado.</p>';
            return;
        }

        products.forEach((prod, index) => {
            const card = document.createElement('div');
            card.className = 'admin-prod-card';
            const imgUrl = prod.image || 'https://via.placeholder.com/60/000/fff?text=Prod';
            
            card.innerHTML = `
                <img src="${imgUrl}" class="admin-prod-img">
                <div class="admin-prod-info">
                    <h4>${prod.name}</h4>
                    <p>R$ ${parseFloat(prod.price).toFixed(2)}</p>
                </div>
                <button class="delete-prod-btn" onclick="deleteProduct(${index})">
                    <i data-lucide="trash-2" style="width: 16px;"></i>
                </button>
            `;
            adminProductsList.appendChild(card);
        });
        if (window.lucide) lucide.createIcons();
    }

    window.deleteProduct = function(index) {
        const productsStr = localStorage.getItem('wandeath_products');
        const products = productsStr ? JSON.parse(productsStr) : [];
        products.splice(index, 1);
        localStorage.setItem('wandeath_products', JSON.stringify(products));
        renderAdminProducts();
    }

    addProductBtn.addEventListener('click', () => {
        const name = document.getElementById('prod-name').value;
        const price = document.getElementById('prod-price').value;
        const category = document.getElementById('prod-category').value;
        const description = document.getElementById('prod-desc').value;
        const delivery = document.getElementById('prod-delivery').value;
        const minQty = document.getElementById('prod-min').value || 1;
        const maxQty = document.getElementById('prod-max').value || 100;
        const imageFile = document.getElementById('prod-image').files[0];

        if (!name || !price) {
            alert('Preencha pelo menos Nome e Preço!');
            return;
        }

        const saveProduct = (imageData) => {
            const productsStr = localStorage.getItem('wandeath_products');
            const products = productsStr ? JSON.parse(productsStr) : [];

            products.push({ 
                name, 
                price, 
                category, 
                description: description || 'Solução premium para máxima performance.',
                delivery: delivery || '',
                minQty: parseInt(minQty),
                maxQty: parseInt(maxQty),
                image: imageData || '../img-rotativa/1gb.png' 
            });
            
            localStorage.setItem('wandeath_products', JSON.stringify(products));

            // Clear inputs
            document.getElementById('prod-name').value = '';
            document.getElementById('prod-price').value = '';
            document.getElementById('prod-desc').value = '';
            document.getElementById('prod-delivery').value = '';
            document.getElementById('prod-min').value = '1';
            document.getElementById('prod-max').value = '100';
            document.getElementById('prod-image').value = '';

            renderAdminProducts();
            alert('Produto cadastrado com sucesso!');
        };

        if (imageFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                saveProduct(reader.result);
            };
            reader.readAsDataURL(imageFile);
        } else {
            saveProduct(null);
        }
    });

    // Dashboard Mock Data Initialization
    function initDashboard() {
        // Just for visual effect when we create the dashboard section
    }

    // Listen for incoming messages from the User
    window.addEventListener('storage', (e) => {
        const sectionChat = document.getElementById('section-chat');
        if (e.key === 'wandeath_chat_history' && sectionChat && sectionChat.style.display !== 'none') {
            renderAdminMessages();
            playNotification();
        }
    });

    function playNotification() {
        try {
            // A simple beep using Web Audio API to alert the admin
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, context.currentTime); // A5
            gainNode.gain.setValueAtTime(0.1, context.currentTime);
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.5);
            oscillator.stop(context.currentTime + 0.5);
        } catch(e) {}
    }
    // ─── Coupons Logic ───
    function renderAdminCoupons() {
        const list = document.getElementById('coupons-list');
        if (!list) return;
        const coupons = JSON.parse(localStorage.getItem('wandeath_coupons') || '[]');
        if (coupons.length === 0) {
            list.innerHTML = '<p style="color:var(--text-sec);">Nenhum cupom cadastrado.</p>';
            return;
        }
        list.innerHTML = coupons.map((c, i) => `
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; padding:18px; display:flex; align-items:center; justify-content:space-between; gap:15px;">
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="width:42px; height:42px; background:rgba(238,0,0,0.1); border:1px solid rgba(238,0,0,0.2); border-radius:10px; display:flex; align-items:center; justify-content:center;">
                        <i data-lucide="tag" style="width:18px; color:var(--primary);"></i>
                    </div>
                    <div>
                        <strong style="font-size:15px; letter-spacing:1px;">${c.name}</strong>
                        <div style="font-size:12px; color:var(--text-sec); margin-top:3px;">
                            ${c.discount}% de desconto &bull;
                            ${c.type === 'unlimited' ? 'Ilimitado' : `${c.usesLeft} uso${c.usesLeft !== 1 ? 's' : ''} restante${c.usesLeft !== 1 ? 's' : ''} de ${c.maxUses}`}
                        </div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.2); color:#22c55e; font-size:11px; font-weight:800; padding:4px 12px; border-radius:50px;">
                        ${c.type === 'unlimited' ? '&#8734; usos' : `${c.usesLeft}/${c.maxUses}`}
                    </span>
                    <button onclick="deleteCoupon(${i})" style="background:rgba(238,0,0,0.05); color:var(--primary); border:1px solid rgba(238,0,0,0.2); width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:0.3s;">
                        <i data-lucide="trash-2" style="width:15px;"></i>
                    </button>
                </div>
            </div>`).join('');
        if (window.lucide) lucide.createIcons();
    }

    window.deleteCoupon = function(index) {
        const coupons = JSON.parse(localStorage.getItem('wandeath_coupons') || '[]');
        coupons.splice(index, 1);
        localStorage.setItem('wandeath_coupons', JSON.stringify(coupons));
        renderAdminCoupons();
    };

    const addCouponBtn = document.getElementById('add-coupon-btn');
    const couponTypeSelect = document.getElementById('coupon-type');
    const couponLimitGroup = document.getElementById('coupon-limit-group');

    if (couponTypeSelect) {
        couponTypeSelect.addEventListener('change', () => {
            if (couponLimitGroup) couponLimitGroup.style.display = couponTypeSelect.value === 'limited' ? 'flex' : 'none';
        });
    }

    if (addCouponBtn) {
        addCouponBtn.addEventListener('click', () => {
            const name = document.getElementById('coupon-name').value.trim().toUpperCase();
            const pct = parseInt(document.getElementById('coupon-pct').value);
            const type = document.getElementById('coupon-type').value;
            const limit = parseInt(document.getElementById('coupon-limit')?.value) || 0;

            if (!name) return alert('Informe o nome do cupom!');
            if (!pct || pct < 1 || pct > 100) return alert('Informe um desconto válido (1-100)!');
            if (type === 'limited' && (!limit || limit < 1)) return alert('Informe o máximo de usos!');

            const coupons = JSON.parse(localStorage.getItem('wandeath_coupons') || '[]');
            if (coupons.find(c => c.name === name)) return alert('Já existe um cupom com esse nome!');

            coupons.push({
                name,
                discount: pct,
                type,
                maxUses: type === 'limited' ? limit : null,
                usesLeft: type === 'limited' ? limit : null,
                usedCount: 0,
                createdAt: Date.now()
            });
            localStorage.setItem('wandeath_coupons', JSON.stringify(coupons));

            document.getElementById('coupon-name').value = '';
            document.getElementById('coupon-pct').value = '';
            if (document.getElementById('coupon-limit')) document.getElementById('coupon-limit').value = '';

            renderAdminCoupons();
            alert('Cupom criado com sucesso!');
        });
    }
});
