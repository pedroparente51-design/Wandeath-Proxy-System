/* 
   CALIXTO VIP - ELITE ENGINE
   Neural network particles + Mouse glow + Scroll effects
*/

document.addEventListener('DOMContentLoaded', () => {
    initMouseGlow();
    initScrollReveal();
    initScrollProgress();
    initNeuralNetwork();
    initInteractiveBackground();
    initFAQ();
    checkLoginState();
    renderStoreProducts();
    initProductTabs();
    initOrdersModal();
    initProxyChecker();
    initCheckout();
});

// ─── Orders Logic ───
// ─── Checkout Logic ───
function initCheckout() {
    const modal = document.getElementById('checkout-modal');
    const closeBtn = document.getElementById('close-checkout-btn');
    const confirmBtn = document.getElementById('confirm-payment-btn');

    if (!modal) return;

    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('show');
    
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const name = document.getElementById('checkout-name').value;
            const email = document.getElementById('checkout-email').value;
            if (!name || !email) return alert('Por favor, preencha seu nome e email.');
            
            finalizePurchase();
        };
    }
}

function initOrdersModal() {
    const modal = document.getElementById('orders-modal');
    const closeBtn = document.querySelector('.close-modal');

    // Specific selector for the profile dropdown 'Meus Pedidos'
    const profileOrders = document.querySelector('.header-user-btn .dropdown-menu a:nth-child(1)'); 
    
    const toggleModal = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        modal.classList.toggle('show');
        if (modal.classList.contains('show')) renderOrders();
    };

    if (profileOrders) profileOrders.onclick = toggleModal;
    if (closeBtn) closeBtn.onclick = toggleModal;
    
    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });
}

function renderOrders() {
    const list = document.getElementById('my-orders-list');
    const ordersStr = localStorage.getItem('wandeath_orders');
    const orders = ordersStr ? JSON.parse(ordersStr) : [];

    if (orders.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-sec); padding: 40px;">Você ainda não possui pedidos.</p>';
        return;
    }

    list.innerHTML = '';
    orders.forEach(order => {
        const item = document.createElement('div');
        item.className = 'order-item';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4>${order.productName}</h4>
                <small style="color: var(--text-sec);">${new Date(order.date).toLocaleDateString()}</small>
            </div>
            <p style="font-size: 13px; margin: 10px 0;">Status: <span style="color: #00ff66;">Pago (Entregue)</span></p>
            <div class="order-delivery">
                <strong>Sua Proxy:</strong><br>
                ${order.delivery}
            </div>
        `;
        list.appendChild(item);
    });
}

// ─── Proxy Checker Logic ───
function initProxyChecker() {
    const openBtn = document.getElementById('open-checker-btn');
    const modal = document.getElementById('checker-modal');
    const closeBtn = document.getElementById('close-checker-btn');
    const tabs = document.querySelectorAll('.checker-tab-btn');
    const contents = document.querySelectorAll('.checker-tab-content');

    if (!modal) return;

    const toggleModal = (e) => {
        if (e) e.preventDefault();
        modal.classList.toggle('show');
    };

    if (openBtn) openBtn.onclick = toggleModal;
    if (closeBtn) closeBtn.onclick = toggleModal;

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.style.display = 'none');
            
            tab.classList.add('active');
            const target = document.getElementById(tab.dataset.tab);
            if (target) target.style.display = 'block';
        });
    });

    // Extraction Logic (Raw Tab)
    const rawBtn = document.querySelector('#tab-raw .btn-checker');
    const rawInput = document.getElementById('proxy-raw');

    if (rawBtn) {
        rawBtn.addEventListener('click', () => {
            const val = rawInput.value.trim();
            if (!val) return alert('Cole sua proxy!');
            
            const parts = val.split(':');
            if (parts.length >= 4) {
                const [ip, port, user, pass] = parts;
                alert(`Proxy Detectada!\nIP: ${ip}\nPorta: ${port}\nUsuário: ${user}\nSenha: ${pass}`);
            } else {
                alert('Formato inválido! Use ip:porta:usuario:senha');
            }
        });
    }
}

// ─── Products Rendering Update ───
function renderStoreProducts(filter = 'all') {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    let productsStr = localStorage.getItem('wandeath_products');
    let products = productsStr ? JSON.parse(productsStr) : [];

    // Default products if none exist
    if (products.length === 0) {
        products = [
            { 
                name: "Proxy Residencial Rotativa BR - 1GB", 
                price: "13.99", 
                category: "rotativa", 
                image: "../img-rotativa/1gb.png", 
                tag: "MAIS VENDIDO", 
                description: `🌐 Proxy Residencial Rotativa BR - 1GB 🔄
⚙️Formato: IP:PORTA:USUÁRIO:SENHA

🔐Garanta privacidade, segurança e eficiência com nossa Proxy Rotativo Residencial BR! Com um IP novo a cada conexão, você navega de forma anônima e evita bloqueios, tornando suas operações mais seguras e eficazes.

🔍 Consumo em tempo real: Acesse nosso site para verificação de GBs disponíveis.
https://rh7checker.com/ (insira o usuário e senha da proxy comprada)

📞 Equipe de Suporte 24/7:
Chat ao vivo rápido e eficaz exclusivo no site
https://wa.me/5592981794179

🚀 Benefícios:
✅ Ideal para Cooperação com Casas Chinesas 🇨🇳 – Acesso eficiente e sem restrições.
✅ Privacidade Reforçada 🔐 – Proteção total com IPs rotativos, dificultando rastreamentos.
✅ Alto Desempenho ⚡ – Conexão rápida e estável para todas as suas necessidades online.
✅ Mais Segurança 🛡️ – Blindagem contra ataques e monitoramento indesejado.`, 
                delivery: "187.12.44.1:8080:wandeath_user:pass123\n187.12.44.2:8080:wandeath_user:pass123\n187.12.44.3:8080:wandeath_user:pass123", 
                minQty: 1, 
                maxQty: 100 
            },
            { name: "Rotativa Mobile Premium", price: "27.79", category: "rotativa", image: "../img-rotativa/3gb.png", tag: "Premium", description: "IPs móveis reais (4G/5G).", delivery: "proxy-mob:5678:user:pass", minQty: 1, maxQty: 50 },
            { name: "Residencial Fixa", price: "46.19", category: "fixa", image: "../img-rotativa/5gb.png", tag: "Contingência", description: "IPs dedicados estáveis.", delivery: "proxy-fixa:9999:user:pass", minQty: 1, maxQty: 20 }
        ];
        localStorage.setItem('wandeath_products', JSON.stringify(products));
    }

    // Filter logic
    let filteredProducts = [];
    if (filter === 'all') {
        // "Destaques" should only show 3 items
        filteredProducts = products.slice(0, 3);
        grid.classList.add('featured-layout');
    } else {
        filteredProducts = products.filter(p => p.category === filter);
        grid.classList.remove('featured-layout');
    }
    grid.innerHTML = '';

    if (filteredProducts.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-sec); padding: 40px;">Nenhum produto nesta categoria.</p>';
        return;
    }

    filteredProducts.forEach(prod => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card rx-reveal';
        
        const tagHtml = prod.tag ? `<div class="product-tag">${prod.tag}</div>` : '';
        const imgUrl = prod.image || 'https://via.placeholder.com/400x533/000/fff?text=Wandeath+VIP';
        
        // Stock logic: each line is 1 unit
        const stockLines = prod.delivery ? prod.delivery.trim().split('\n') : [];
        const stockCount = stockLines.length;

        const isFeatured = filter === 'all';
        const buttonsHtml = isFeatured ? `
            <button class="btn-buy btn-shine" style="width: 100%; padding: 12px; background: var(--primary); border: none; border-radius: 8px; color: #fff; font-weight: 800; cursor: pointer;" onclick="processPurchase('${prod.name}')">Comprar agora</button>
        ` : `
            <input type="number" class="qty-input" value="${prod.minQty || 1}" min="${prod.minQty || 1}" max="${prod.maxQty || 100}" 
                    style="width: 55px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: #fff; padding: 10px; border-radius: 8px; font-size: 12px;">
            <button class="btn-buy" style="padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: #fff; cursor: pointer;" onclick="addToCart('${prod.name}', this)">Carrinho</button>
            <button class="btn-buy btn-shine" style="flex: 1; padding: 10px; background: var(--primary); border: none; border-radius: 8px; color: #fff; font-weight: 800; cursor: pointer;" onclick="processPurchase('${prod.name}', this)">Comprar</button>
        `;

        productCard.innerHTML = `
            ${tagHtml}
            <div class="product-img">
                <img src="${imgUrl}" alt="${prod.name}" onerror="this.src='../logo.png'">
                <div class="img-overlay"></div>
            </div>
            <div class="product-content">
                <h4 class="product-title">🛜 ${prod.name}</h4>
                <div class="stock-info" style="font-size: 11px; margin: 10px 0; display: flex; justify-content: space-between;">
                    <span style="color: ${stockCount > 0 ? '#00ff66' : '#ff4a4a'}">Estoque: ${stockCount}</span>
                    <span style="color: var(--text-sec)">Mín: ${prod.minQty || 1}</span>
                </div>
                <div class="price-section">
                    <div class="price-info">
                        <p class="price-val">R$ ${parseFloat(prod.price).toFixed(2)}</p>
                        <p class="price-label">À vista no Pix</p>
                    </div>
                    <div class="pix-badge"><span>☠</span></div>
                </div>
            </div>
            <div class="product-footer" style="display: flex; gap: 8px; align-items: center; padding: 15px;">
                ${buttonsHtml}
            </div>
        `;
        grid.appendChild(productCard);
        
        // Observe new card for reveal
        if (window.revealObserver) window.revealObserver.observe(productCard);
    });

    if (window.lucide) lucide.createIcons();
}

function processPurchase(name) {
    window.location.href = `../produto/produto.html?name=${encodeURIComponent(name)}`;
}

window.processPurchase = processPurchase;

window.addToCart = addToCart;
window.processPurchase = processPurchase;

function getCart() {
    return JSON.parse(localStorage.getItem('wandeath_cart') || '[]');
}

function updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

window.updateCartBadge = updateCartBadge;

window.logout = function() {
    localStorage.removeItem('wandeath_user');
    window.location.reload();
};

function checkLoginState() {
    const user = localStorage.getItem('wandeath_user');
    const userBtn = document.querySelector('.header-user-btn');
    
    if (!userBtn) return;

    userBtn.style.setProperty('display', 'flex', 'important');
    
    const userIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

    if (user) {
        const userData = JSON.parse(user);
        userBtn.classList.add('logged-in');
        userBtn.innerHTML = `${userIcon}<span>${userData.username || 'Meu Perfil'}</span>`;
        userBtn.title = userData.username || 'Meu Perfil';
        userBtn.onclick = (e) => {
            e.preventDefault();
            window.location.href = './orders.html';
        };
    } else {
        userBtn.classList.remove('logged-in');
        userBtn.onclick = null;
        userBtn.innerHTML = `${userIcon}<span>Área do Cliente</span>`;
        userBtn.title = 'Área do Cliente';
        
        const path = window.location.pathname;
        let loginPath = '../login/login.html';
        if (path.includes('/login/')) loginPath = './login.html';
        else if (path.endsWith('index.html') && !path.includes('/home/')) loginPath = 'login/login.html';
        
        userBtn.href = loginPath;
    }
}

function renderUserOrders() {
    const list = document.getElementById('my-orders-list');
    if (!list) return;
    
    const orders = JSON.parse(localStorage.getItem('wandeath_orders') || '[]');
    if (orders.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-sec); padding: 40px;">Você ainda não possui pedidos.</p>';
        return;
    }

    list.innerHTML = orders.reverse().map(order => `
        <div class="order-item">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h4>${order.productName}</h4>
                <small>${new Date(order.date).toLocaleDateString()}</small>
            </div>
            <div class="order-delivery">
                ${order.delivery.split('\n').join('<br>')}
            </div>
            <div style="margin-top:10px; font-size:12px; color:var(--text-sec);">
                Total: R$ ${parseFloat(order.total).toFixed(2)}
            </div>
        </div>
    `).join('');
}

const MP_ACCESS_TOKEN = 'APP_USR-6939778403757007-042321-66d2bef7d6ee6c3d3c269703ab411f51-256063981';

async function finalizePurchase() {
    const name = document.getElementById('checkout-name').value;
    const email = document.getElementById('checkout-email').value;
    
    if (!name || !email) return alert('Por favor, preencha seu nome e email.');
    if (!window.currentCheckout) return alert('Nenhum produto selecionado.');
    
    const { product, qty } = window.currentCheckout;
    const total = parseFloat(product.price) * qty;
    const checkoutBody = document.querySelector('.checkout-body');

    // Show Loading
    checkoutBody.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 0;">
            <div class="loader" style="width: 50px; height: 50px; border: 5px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <h3>Gerando seu PIX...</h3>
            <p style="color: var(--text-sec);">Aguarde enquanto conectamos ao Mercado Pago.</p>
        </div>
    `;

    try {
        // Step 1: Create payment
        const paymentData = {
            transaction_amount: total,
            description: `Wandeath VIP - ${product.name}`,
            payment_method_id: 'pix',
            payer: {
                email: email,
                first_name: name.split(' ')[0],
                last_name: name.split(' ').slice(1).join(' ') || 'Cliente',
                identification: { type: 'CPF', number: '12345678909' }
            }
        };

        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `wandeath-${Date.now()}`
            },
            body: JSON.stringify(paymentData)
        });

        const data = await response.json();

        if (!data.id || !data.point_of_interaction || !data.point_of_interaction.transaction_data) {
            throw new Error(data.message || JSON.stringify(data));
        }

        const pixData = data.point_of_interaction.transaction_data;
        const paymentId = data.id;
        let pollInterval = null;

        // Step 2: Show PIX to user
        checkoutBody.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 20px;">
                <h2 style="margin-bottom: 5px;">PIX Gerado</h2>
                <p style="color: var(--text-sec); margin-bottom: 20px;">Escaneie o QR Code e realize o pagamento.</p>
                
                <div style="background: #fff; padding: 20px; border-radius: 16px; display: inline-block; margin-bottom: 20px;">
                    <img src="data:image/png;base64,${pixData.qr_code_base64}" alt="QR Code PIX" style="width: 220px; height: 220px;">
                </div>

                <div style="max-width: 500px; margin: 0 auto 20px;">
                    <label style="display: block; font-size: 12px; font-weight: 800; color: var(--text-sec); text-transform: uppercase; margin-bottom: 8px;">PIX Copia e Cola</label>
                    <div style="display: flex; gap: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 5px; border-radius: 10px;">
                        <input type="text" value="${pixData.qr_code}" id="pix-copy-input" readonly style="flex: 1; background: transparent; border: none; color: #fff; padding: 10px; font-size: 12px;">
                        <button onclick="copyPixCode()" style="background: var(--primary); color: #fff; border: none; padding: 0 16px; border-radius: 8px; font-weight: 800; cursor: pointer;">Copiar</button>
                    </div>
                </div>

                <div id="payment-status-msg" style="display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--text-sec); font-size: 14px;">
                    <div class="loader" style="width: 18px; height: 18px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; flex-shrink: 0;"></div>
                    <span>Aguardando confirmação do pagamento...</span>
                </div>
                <p style="color: var(--text-sec); font-size: 12px; margin-top: 8px;">Verificando automaticamente a cada 5 segundos</p>
            </div>
        `;

        // Step 3: Poll payment status
        pollInterval = setInterval(async () => {
            try {
                const statusRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                    headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
                });
                const statusData = await statusRes.json();
                console.log('Payment status:', statusData.status);

                if (statusData.status === 'approved') {
                    clearInterval(pollInterval);
                    completePurchaseProcess();
                    showPaymentSuccess(product, qty, total);
                } else if (statusData.status === 'cancelled' || statusData.status === 'rejected') {
                    clearInterval(pollInterval);
                    const msg = document.getElementById('payment-status-msg');
                    if (msg) msg.innerHTML = '<span style="color:#ff4a4a;">❌ Pagamento cancelado ou recusado.</span>';
                }
                // 'pending' — keep polling
            } catch (e) {
                console.warn('Poll error:', e.message);
            }
        }, 5000);

        // Auto-cancel polling after 15 minutes
        setTimeout(() => {
            if (pollInterval) {
                clearInterval(pollInterval);
                const msg = document.getElementById('payment-status-msg');
                if (msg) msg.innerHTML = '<span style="color:#ff4a4a;">⏱ Tempo expirado. Gere um novo PIX.</span>';
            }
        }, 15 * 60 * 1000);

    } catch (error) {
        console.error('MP Error:', error);
        checkoutBody.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h3 style="color: #ff4a4a; margin-bottom: 10px;">Erro ao gerar PIX</h3>
                <p style="color: var(--text-sec); font-size: 13px; margin-bottom: 20px;">${error.message}</p>
                <button onclick="document.getElementById('checkout-modal').classList.remove('show')"
                    style="padding: 12px 30px; background: var(--primary); border: none; border-radius: 10px; color: #fff; font-weight: 800; cursor: pointer;">
                    Fechar
                </button>
            </div>
        `;
    }
}

function showPaymentSuccess(product, qty, total, deliveredItems = []) {
    const checkoutBody = document.querySelector('.checkout-body');
    if (!checkoutBody) return;

    const itemsHtml = deliveredItems.map((line, i) => `
        <div style="display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:8px; padding:10px 14px; margin-bottom:8px;">
            <span style="font-size:11px; font-weight:800; color:var(--text-sec); min-width:20px;">${i+1}</span>
            <span style="flex:1; font-family:monospace; font-size:13px; color:#ccc; word-break:break-all;">${line}</span>
            <button onclick="copyToClipboard('${line.replace(/'/g,"\\'")}', this)" style="background:none; border:none; color:var(--text-sec); cursor:pointer; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700;">Copiar</button>
        </div>`).join('');

    const allText = deliveredItems.join('\n');

    checkoutBody.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px;">
            <div style="width: 80px; height: 80px; background: rgba(74,222,128,0.1); border: 2px solid #4ade80; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 40px; color:#4ade80;">✓</div>
            <h2 style="color: #4ade80; margin-bottom: 5px;">Pagamento Confirmado!</h2>
            <p style="color: var(--text-sec); margin-bottom: 25px;">R$ ${total.toFixed(2)} aprovado • ${qty}x ${product.name}</p>
            
            <div style="text-align: left; max-width: 550px; margin: 0 auto;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                    <span style="font-size:12px; font-weight:700; color:var(--text-sec); text-transform:uppercase; letter-spacing:1px;">Seus Produtos</span>
                    <button onclick="copyToClipboard('${allText.replace(/'/g,"\\'")}', this)" style="background:rgba(238,0,0,0.1); border:1px solid rgba(238,0,0,0.2); color:var(--primary); padding:6px 14px; border-radius:8px; font-size:11px; font-weight:800; cursor:pointer;">Copiar tudo</button>
                </div>
                <div style="max-height: 250px; overflow-y: auto; padding-right: 5px;">
                    ${itemsHtml}
                </div>
            </div>

            <div style="margin-top: 30px; display:flex; gap:15px; justify-content:center;">
                <button onclick="document.getElementById('checkout-modal').classList.remove('show'); window.location.reload();" 
                    style="padding: 14px 30px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 10px; color: #fff; font-weight: 800; cursor: pointer;">
                    Fechar
                </button>
                <a href="../pedidos/pedidos.html" 
                    style="padding: 14px 30px; background: var(--primary); border: none; border-radius: 10px; color: #fff; font-weight: 800; text-decoration:none; display:flex; align-items:center;">
                    Ver Meus Pedidos
                </a>
            </div>
        </div>
    `;
}

window.copyToClipboard = function(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const orig = btn.innerText;
        btn.innerText = '✓ Copiado';
        btn.style.color = '#4ade80';
        setTimeout(() => {
            btn.innerText = orig;
            btn.style.color = '';
        }, 2000);
    });
};


window.copyPixCode = function() {
    const input = document.getElementById('pix-copy-input');
    if (input) {
        input.select();
        document.execCommand('copy');
        alert('Código PIX copiado!');
    }
};

window.simulatePaymentSuccess = function() {
    completePurchaseProcess();
};

function completePurchaseProcess() {
    if (!window.currentCheckout) return;
    const { product, qty } = window.currentCheckout;
    
    try {
        const products = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
        const prodIndex = products.findIndex(p => p.name === product.name);
        if (prodIndex === -1) return;
        const prod = products[prodIndex];

        const stockLines = prod.delivery ? prod.delivery.trim().split('\n').filter(Boolean) : [];
        const deliveredItems = stockLines.splice(0, qty);
        prod.delivery = stockLines.join('\n');
        localStorage.setItem('wandeath_products', JSON.stringify(products));

        // Handle Coupon Use
        if (window.currentCoupon && window.currentCoupon.type === 'limited') {
            const coupons = JSON.parse(localStorage.getItem('wandeath_coupons') || '[]');
            const cIndex = coupons.findIndex(c => c.name === window.currentCoupon.name);
            if (cIndex !== -1) {
                coupons[cIndex].usesLeft--;
                coupons[cIndex].usedCount++;
                localStorage.setItem('wandeath_coupons', JSON.stringify(coupons));
            }
        }

        const subtotal = parseFloat(prod.price) * qty;
        const total = window.currentCoupon ? (subtotal * (1 - window.currentCoupon.discount / 100)) : subtotal;

        const orders = JSON.parse(localStorage.getItem('wandeath_orders') || '[]');
        orders.push({
            productName: prod.name,
            delivery: deliveredItems.join('\n'),
            date: Date.now(),
            qty: qty,
            total: total
        });
        localStorage.setItem('wandeath_orders', JSON.stringify(orders));
        
        showPaymentSuccess(product, qty, total, deliveredItems);
    } catch (e) {
        console.error('completePurchaseProcess error:', e);
    }
}

function initProductTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderStoreProducts(tab.dataset.category);
        });
    });
}


/* ─── Check Login State ─────────────────────────── */
function checkLoginState() {
    const isLoggedIn = localStorage.getItem('wandeath_logged_in');
    const userDataStr = localStorage.getItem('wandeath_user');
    const userBtn = document.querySelector('.header-user-btn');
    
    if (isLoggedIn === 'true' && userBtn) {
        let name = "Admin";
        if (userDataStr) {
            try {
                const user = JSON.parse(userDataStr);
                if (user && user.name) {
                    name = user.name.split(' ')[0]; // First name only
                }
            } catch (e) {}
        }
        
        userBtn.outerHTML = `
            <div class="nav-dropdown profile-dropdown">
                <a href="javascript:void(0);" class="header-user-btn dropdown-toggle" style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 28px; height: 28px; flex-shrink: 0; background: rgba(255,215,0,0.15); border: 1px solid var(--gold); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: var(--gold);">
                        ${name.charAt(0).toUpperCase()}
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
                        Olá, ${name} 
                        <i data-lucide="chevron-down" style="width: 14px;"></i>
                    </div>
                </a>
                <div class="dropdown-menu">
                    <a href="#" onclick="window.wandeathOpenOrders(event)"><i data-lucide="package" style="width: 16px;"></i> Meus Pedidos</a>
                    <div style="height: 1px; background: var(--border); margin: 5px 0;"></div>
                    <a href="#" onclick="window.wandeathLogout(event)" style="color: #ff4a4a;"><i data-lucide="log-out" style="width: 16px;"></i> Sair da conta</a>
                </div>
            </div>
        `;

        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        window.wandeathLogout = function(e) {
            e.preventDefault();
            if(confirm('Tem certeza que deseja sair?')) {
                localStorage.removeItem('wandeath_logged_in');
                window.location.reload();
            }
        };

window.goToPaymentStep = function() {
    document.getElementById('checkout-step-info').style.display = 'none';
    document.getElementById('checkout-step-payment').style.display = 'grid';
    if (window.lucide) lucide.createIcons();
};

window.backToInfoStep = function() {
    document.getElementById('checkout-step-info').style.display = 'block';
    document.getElementById('checkout-step-payment').style.display = 'none';
};
    }
}

/* ─── Mouse Follow Glow ─────────────────────────── */
function initMouseGlow() {
    const glow = document.getElementById('mouse-glow');
    if (!glow) return;

    let mouseX = 0, mouseY = 0;
    let ballX = 0, ballY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        ballX += (mouseX - ballX) * 0.08;
        ballY += (mouseY - ballY) * 0.08;
        glow.style.left = ballX + 'px';
        glow.style.top = ballY + 'px';
        requestAnimationFrame(animate);
    }
    animate();
}

/* ─── Scroll Reveal ─────────────────────────────── */
function initScrollReveal() {
    window.revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('rx-reveal--visible');
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.rx-reveal').forEach(el => window.revealObserver.observe(el));
}

/* ─── Scroll Progress Bar ───────────────────────── */
function initScrollProgress() {
    const bar = document.getElementById('scroll-bar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const h = document.documentElement;
        const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
        bar.style.width = pct + '%';
    });
}

/* ─── Neural Network Canvas ─────────────────────── */
function initNeuralNetwork() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles = [];
    let mouse = { x: -9999, y: -9999 };
    const COUNT = 90;
    const MAX_DIST = 160;
    const MOUSE_DIST = 200;

    /* Colors from CSS vars (match #ee0000) */
    const COL_DOT = 'rgba(238, 0, 0, 0.55)';
    const COL_LINE = 'rgba(238, 0, 0, {o})';
    const COL_MOUSE = 'rgba(238, 0, 0, {o})';

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', () => { resize(); spawnParticles(); });
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    class Particle {
        constructor() { this.reset(true); }

        reset(rand = false) {
            this.x = rand ? Math.random() * W : (Math.random() < 0.5 ? 0 : W);
            this.y = rand ? Math.random() * H : Math.random() * H;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.r = Math.random() * 1.8 + 0.4;
            this.alpha = Math.random() * 0.5 + 0.3;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            /* Subtle mouse attraction */
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < MOUSE_DIST) {
                this.x += dx * 0.004;
                this.y += dy * 0.004;
            }

            /* Bounce off edges */
            if (this.x < 0 || this.x > W) this.vx *= -1;
            if (this.y < 0 || this.y > H) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = COL_DOT;
            ctx.fill();
        }
    }

    function spawnParticles() {
        particles = [];
        for (let i = 0; i < COUNT; i++) particles.push(new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            const a = particles[i];

            /* Particle → Particle lines */
            for (let j = i + 1; j < particles.length; j++) {
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const d = Math.sqrt(dx * dx + dy * dy);

                if (d < MAX_DIST) {
                    const opacity = (1 - d / MAX_DIST) * 0.18;
                    ctx.strokeStyle = COL_LINE.replace('{o}', opacity);
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }

            /* Particle → Mouse lines */
            const mdx = a.x - mouse.x;
            const mdy = a.y - mouse.y;
            const md = Math.sqrt(mdx * mdx + mdy * mdy);

            if (md < MOUSE_DIST) {
                const opacity = (1 - md / MOUSE_DIST) * 0.55;
                ctx.strokeStyle = COL_MOUSE.replace('{o}', opacity);
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        requestAnimationFrame(loop);
    }

    resize();
    spawnParticles();
    loop();
}

/* ─── FAQ Accordion ─────────────────────────────── */
function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            const content = item.querySelector('.faq-content');
            const isOpen = content.style.display === 'block';

            /* Close all */
            document.querySelectorAll('.faq-content').forEach(c => c.style.display = 'none');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

            /* Toggle clicked */
            if (!isOpen) {
                content.style.display = 'block';
                item.classList.add('open');
            }
        });
    });
}

/* ─── Interactive Background ─────────────────────────────── */
function initInteractiveBackground() {
    const shapes = document.querySelectorAll('.parallax-shape');
    if (!shapes.length) return;

    window.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 20;
            const xOffset = (window.innerWidth / 2 - e.clientX) * speed / 1000;
            const yOffset = (window.innerHeight / 2 - e.clientY) * speed / 1000;
            
            shape.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    });
}

// ─── Chatbox Logic ───
document.addEventListener('DOMContentLoaded', () => {
    const openChatBtn = document.getElementById('open-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatboxContainer = document.getElementById('chatbox-container');
    const chatboxMessages = document.getElementById('chatbox-messages');
    const chatboxInput = document.getElementById('chatbox-input-field');
    const chatboxSendBtn = document.getElementById('chatbox-send-btn');

    if (!openChatBtn || !chatboxContainer) return;

    // Toggle Chatbox
    openChatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        chatboxContainer.classList.add('show');
        renderMessages();
        setTimeout(() => chatboxInput.focus(), 100);
    });

    closeChatBtn.addEventListener('click', () => {
        chatboxContainer.classList.remove('show');
    });

    // Render Messages from LocalStorage
    function renderMessages() {
        const historyStr = localStorage.getItem('wandeath_chat_history');
        const history = historyStr ? JSON.parse(historyStr) : [];
        
        chatboxMessages.innerHTML = '';
        
        if (history.length === 0) {
            chatboxMessages.innerHTML = `
                <div style="text-align: center; color: var(--text-sec); font-size: 12px; margin-top: 20px;">
                    Inicie uma conversa conosco!
                </div>
            `;
            return;
        }

        history.forEach(msg => {
            const msgEl = document.createElement('div');
            msgEl.className = `chat-msg ${msg.sender}`;
            msgEl.textContent = msg.text;
            chatboxMessages.appendChild(msgEl);
        });

        // Scroll to bottom
        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
    }

    // Send Message
    function sendMessage() {
        const text = chatboxInput.value.trim();
        if (!text) return;

        const historyStr = localStorage.getItem('wandeath_chat_history');
        const history = historyStr ? JSON.parse(historyStr) : [];

        history.push({
            sender: 'user',
            text: text,
            timestamp: Date.now()
        });

        localStorage.setItem('wandeath_chat_history', JSON.stringify(history));
        
        chatboxInput.value = '';
        renderMessages();
    }

    chatboxSendBtn.addEventListener('click', sendMessage);
    chatboxInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Listen for storage changes (Real-time updates from Admin Panel)
    window.addEventListener('storage', (e) => {
        if (e.key === 'wandeath_chat_history' && chatboxContainer.classList.contains('show')) {
            renderMessages();
        }
    });
});
/* ─── End of Chatbox Logic ─── */


