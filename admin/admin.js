// Admin Global Functions
window.showSection = function(sectionId) {
    console.log('[Admin] Trocando para seção:', sectionId);
    
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
            'logs': 'Histórico de Atividades',
            'settings': 'Configurações do Site'
        };
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) pageTitle.textContent = titles[sectionId] || 'Painel Admin';

        if (sectionId === 'chat') renderAdminMessages();
        if (sectionId === 'products') renderAdminProducts();
        if (sectionId === 'coupons') renderAdminCoupons();
        if (sectionId === 'dashboard') renderDashboardMetrics();
        if (sectionId === 'customers') renderAdminCustomers();
        if (sectionId === 'logs') renderAdminLogs();
        if (sectionId === 'settings') renderAdminsList();
    }
};

window.simulateAdminOAuth = function(provider) {
    const width = 500, height = 600;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);
    const popup = window.open('', '_blank', `width=${width},height=${height},top=${top},left=${left}`);
    
    let color = provider === 'Google' ? '#fff' : '#5865F2';
    let bg = provider === 'Google' ? '#111' : '#36393f';
    
    popup.document.write(`
        <html style="font-family: 'Plus Jakarta Sans', sans-serif; text-align: center; padding: 50px; background: ${bg}; color: #fff;">
            <h2 style="margin-top: 40px;">Conectando com ${provider}...</h2>
            <p style="color: #aaa;">Verificando permissões de administrador.</p>
            <div style="margin: 50px auto; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.2); border-top-color: ${color}; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        </html>
    `);

    setTimeout(() => {
        popup.close();
        localStorage.setItem('wandeath_admin_logged', 'true');
        location.reload();
    }, 2000);
};

// Logic functions (must be global or reachable by showSection)
function renderAdminMessages() {
    const chatMessages = document.getElementById('admin-chat-messages');
    if (!chatMessages) return;
    const historyStr = localStorage.getItem('wandeath_chat_history');
    const history = historyStr ? JSON.parse(historyStr) : [];
    chatMessages.innerHTML = '';
    if (history.length === 0) {
        chatMessages.innerHTML = '<div style="text-align: center; color: var(--text-sec); margin-top: 50px;">Nenhuma mensagem recebida ainda.</div>';
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

function renderAdminProducts() {
    const adminProductsList = document.getElementById('admin-products-list');
    if (!adminProductsList) return;
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
        card.innerHTML = `
            <img src="${prod.image || '../img-rotativa/1gb.png'}" class="admin-prod-img">
            <div class="admin-prod-info">
                <h4>${prod.name}</h4>
                <p>R$ ${parseFloat(prod.price).toFixed(2)}</p>
                ${prod.youtubeUrl ? `
                    <a href="${prod.youtubeUrl}" target="_blank" style="font-size:10px; color:#ff0000; display:flex; align-items:center; gap:4px; margin-top:4px; text-decoration:none; font-weight:700;">
                        <i data-lucide="external-link" style="width:10px;"></i> Ver Vídeo Tutorial
                    </a>
                ` : ''}
            </div>
            <div style="display:flex; gap:8px;">
                <button class="edit-prod-btn" onclick="editProduct(${index})" title="Editar Produto">
                    <i data-lucide="edit-3" style="width: 16px;"></i>
                </button>
                <button class="delete-prod-btn" onclick="deleteProduct(${index})" title="Excluir Produto">
                    <i data-lucide="trash-2" style="width: 16px;"></i>
                </button>
            </div>
        `;
        adminProductsList.appendChild(card);
    });
    if (window.lucide) lucide.createIcons();
}

let editingProductIndex = null;

window.editProduct = function(index) {
    const products = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
    const prod = products[index];
    if (!prod) return;

    editingProductIndex = index;
    
    // Populate form
    document.getElementById('prod-name').value = prod.name;
    document.getElementById('prod-price').value = prod.price;
    document.getElementById('prod-category').value = prod.category;
    document.getElementById('prod-desc').value = prod.description;
    document.getElementById('prod-delivery').value = prod.delivery;
    if (document.getElementById('prod-youtube')) document.getElementById('prod-youtube').value = prod.youtubeUrl || '';
    
    // Change button text
    const btn = document.getElementById('add-product-btn');
    if (btn) {
        btn.innerHTML = '<i data-lucide="save"></i> Salvar Alterações';
        if (window.lucide) lucide.createIcons();
    }

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteProduct = function(index) {
    const products = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
    products.splice(index, 1);
    localStorage.setItem('wandeath_products', JSON.stringify(products));
    renderAdminProducts();
};

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
                        ${c.discount}% de desconto &bull; ${c.type === 'unlimited' ? 'Ilimitado' : `${c.usesLeft} usos restantes`}
                    </div>
                </div>
            </div>
            <button onclick="deleteCoupon(${i})" class="delete-prod-btn" style="width:36px; height:36px;">
                <i data-lucide="trash-2" style="width:15px;"></i>
            </button>
        </div>`).join('');
    if (window.lucide) lucide.createIcons();
}

window.deleteCoupon = function(index) {
    const coupons = JSON.parse(localStorage.getItem('wandeath_coupons') || '[]');
    coupons.splice(index, 1);
    localStorage.setItem('wandeath_coupons', JSON.stringify(coupons));
    renderAdminCoupons();
};

function renderAdminCustomers() {
    const listBody = document.getElementById('customers-list-body');
    if (!listBody) return;
    const orders = JSON.parse(localStorage.getItem('wandeath_orders') || '[]');
    const customerMap = {};
    orders.forEach(o => {
        if (!customerMap[o.customerEmail]) {
            customerMap[o.customerEmail] = { name: o.customerName || 'Cliente', totalSpent: 0, orderCount: 0 };
        }
        customerMap[o.customerEmail].totalSpent += o.total || 0;
        customerMap[o.customerEmail].orderCount += 1;
    });
    const emails = Object.keys(customerMap);
    if (emails.length === 0) {
        listBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-sec);">Nenhum cliente ainda.</td></tr>';
        return;
    }
    listBody.innerHTML = emails.map(email => {
        const c = customerMap[email];
        const statusMap = JSON.parse(localStorage.getItem('wandeath_customer_status') || '{}');
        const currentStatus = statusMap[email] || 'Ativo';
        
        let statusClass = 'active';
        if (currentStatus === 'Banido') statusClass = 'banned';
        if (currentStatus === 'Bloqueado') statusClass = 'blocked';

        return `
            <tr>
                <td><div class="avatar-small">${c.name.charAt(0).toUpperCase()}</div></td>
                <td>${c.name}</td>
                <td>${email}</td>
                <td>R$ ${c.totalSpent.toFixed(2)}</td>
                <td><span class="status-tag ${statusClass}">${currentStatus}</span></td>
                <td>
                    <div style="display:flex; gap:8px;">
                        <button onclick="updateCustomerStatus('${email}', 'Banido')" class="btn-action ban" title="Banir Permanente">
                            <i data-lucide="user-x"></i>
                        </button>
                        <button onclick="updateCustomerStatus('${email}', 'Bloqueado')" class="btn-action block" title="Bloquear Temporariamente">
                            <i data-lucide="user-minus"></i>
                        </button>
                        <button onclick="updateCustomerStatus('${email}', 'Ativo')" class="btn-action unlock" title="Desbloquear">
                            <i data-lucide="user-check"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    if (window.lucide) lucide.createIcons();
}

window.updateCustomerStatus = function(email, newStatus) {
    const statusMap = JSON.parse(localStorage.getItem('wandeath_customer_status') || '{}');
    statusMap[email] = newStatus;
    localStorage.setItem('wandeath_customer_status', JSON.stringify(statusMap));
    
    // Log Action
    addLog('Moderação de Cliente', `O cliente ${email} foi marcado como "${newStatus}".`);
    
    renderAdminCustomers();
    console.log(`[Admin] Status de ${email} alterado para: ${newStatus}`);
};

function renderDashboardMetrics() {
    const orders = JSON.parse(localStorage.getItem('wandeath_orders') || '[]');
    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const customersCount = new Set(orders.map(o => o.customerEmail)).size;
    const metricValues = document.querySelectorAll('.metric-card h3');
    if (metricValues.length >= 4) {
        metricValues[0].innerText = `R$ ${totalSales.toFixed(2)}`;
        metricValues[1].innerText = customersCount;
        metricValues[2].innerText = '12'; // Mock
        metricValues[3].innerText = orders.length;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Login
    const adminOverlay = document.getElementById('admin-login-overlay');
    const adminForm = document.getElementById('admin-login-form');
    if (localStorage.getItem('wandeath_admin_logged') !== 'true') {
        if (adminOverlay) adminOverlay.style.display = 'flex';
    }
    if (adminForm) {
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value.trim();
            const pass = document.getElementById('admin-pass').value.trim();
            
            const admins = JSON.parse(localStorage.getItem('wandeath_admins') || '[{"email":"admin@admin.com","pass":"admin"}]');
            const foundAdmin = admins.find(a => a.email === email && a.pass === pass);

            if (foundAdmin) {
                localStorage.setItem('wandeath_admin_logged', 'true');
                if (adminOverlay) adminOverlay.style.display = 'none';
                addLog('Login Admin', `Sessão iniciada por ${email}.`);
            } else {
                const err = document.getElementById('admin-login-error');
                if (err) err.style.display = 'block';
            }
        });
    }

    // Sidebar Navigation Listener
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        sidebarNav.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem && navItem.id && navItem.id.startsWith('nav-')) {
                e.preventDefault();
                window.showSection(navItem.id.replace('nav-', ''));
            }
        });
    }

    // Login Buttons
    const btnGoogle = document.getElementById('btn-login-google');
    const btnDiscord = document.getElementById('btn-login-discord');
    const btnBypass = document.getElementById('btn-bypass-dev');
    if (btnGoogle) btnGoogle.addEventListener('click', () => window.simulateAdminOAuth('Google'));
    if (btnDiscord) btnDiscord.addEventListener('click', () => window.simulateAdminOAuth('Discord'));
    if (btnBypass) btnBypass.addEventListener('click', () => {
        localStorage.setItem('wandeath_admin_logged', 'true');
        location.reload();
    });

    // Chat Send
    const sendBtn = document.getElementById('admin-chat-send');
    const chatInput = document.getElementById('admin-chat-input');
    const sendMsg = () => {
        const text = chatInput.value.trim();
        if (!text) return;
        const history = JSON.parse(localStorage.getItem('wandeath_chat_history') || '[]');
        history.push({ sender: 'admin', text, timestamp: Date.now() });
        localStorage.setItem('wandeath_chat_history', JSON.stringify(history));
        chatInput.value = '';
        renderAdminMessages();
    };
    if (sendBtn) sendBtn.addEventListener('click', sendMsg);
    if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMsg(); });

    // --- Add Product ---
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            const name = document.getElementById('prod-name').value;
            const price = document.getElementById('prod-price').value;
            const category = document.getElementById('prod-category').value;
            const description = document.getElementById('prod-desc').value;
            const delivery = document.getElementById('prod-delivery').value;
            const youtubeUrl = document.getElementById('prod-youtube').value;
            
            if (!name || !price) return alert('Nome e preço são obrigatórios!');

            const products = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
            
            const prodData = {
                name,
                price: parseFloat(price),
                category,
                description: description || 'Produto de alta qualidade.',
                delivery: delivery || '',
                youtubeUrl: youtubeUrl || '',
                image: '../img-rotativa/1gb.png' // Default image
            };

            if (editingProductIndex !== null) {
                products[editingProductIndex] = prodData;
                addLog('Produto Editado', `O produto "${name}" foi atualizado.`);
                editingProductIndex = null;
                addProductBtn.innerHTML = '<i data-lucide="plus"></i> Cadastrar Produto';
                if (window.lucide) lucide.createIcons();
            } else {
                products.push(prodData);
                addLog('Produto Adicionado', `O produto "${name}" foi cadastrado.`);
            }

            localStorage.setItem('wandeath_products', JSON.stringify(products));
            
            // Clear form
            document.getElementById('prod-name').value = '';
            document.getElementById('prod-price').value = '';
            document.getElementById('prod-desc').value = '';
            document.getElementById('prod-delivery').value = '';
            if (document.getElementById('prod-youtube')) document.getElementById('prod-youtube').value = '';

            alert('Produto salvo com sucesso!');
            renderAdminProducts();
        });
    }

    // --- Add Coupon ---
    const addCouponBtn = document.getElementById('add-coupon-btn');
    const couponTypeSelect = document.getElementById('coupon-type');
    const couponLimitGroup = document.getElementById('coupon-limit-group');

    if (couponTypeSelect) {
        couponTypeSelect.addEventListener('change', () => {
            if (couponLimitGroup) {
                couponLimitGroup.style.display = couponTypeSelect.value === 'limited' ? 'flex' : 'none';
            }
        });
    }

    if (addCouponBtn) {
        addCouponBtn.addEventListener('click', () => {
            const name = document.getElementById('coupon-name').value.trim().toUpperCase();
            const pct = document.getElementById('coupon-pct').value;
            const type = document.getElementById('coupon-type').value;
            const limit = document.getElementById('coupon-limit')?.value || 50;

            if (!name || !pct) return alert('Nome e desconto são obrigatórios!');

            const coupons = JSON.parse(localStorage.getItem('wandeath_coupons') || '[]');
            coupons.push({
                name,
                discount: parseInt(pct),
                type,
                usesLeft: type === 'limited' ? parseInt(limit) : null,
                maxUses: type === 'limited' ? parseInt(limit) : null
            });
            localStorage.setItem('wandeath_coupons', JSON.stringify(coupons));
            
            // Log Action
            addLog('Cupom Criado', `O cupom "${name}" de ${pct}% foi criado.`);
            
            alert('Cupom criado!');
            renderAdminCoupons();
        });
    }

    // Initial call
    window.showSection('dashboard');
});

// Logging System
function addLog(action, details) {
    const logs = JSON.parse(localStorage.getItem('wandeath_admin_logs') || '[]');
    logs.unshift({
        id: Date.now(),
        date: new Date().toLocaleString('pt-BR'),
        action: action,
        details: details,
        admin: 'Admin Principal'
    });
    // Keep only last 100 logs
    if (logs.length > 100) logs.pop();
    localStorage.setItem('wandeath_admin_logs', JSON.stringify(logs));
}

function renderAdminLogs() {
    const list = document.getElementById('admin-logs-list');
    if (!list) return;
    const logs = JSON.parse(localStorage.getItem('wandeath_admin_logs') || '[]');
    
    if (logs.length === 0) {
        list.innerHTML = '<p style="color:var(--text-sec); text-align:center; padding:20px;">Nenhuma atividade registrada.</p>';
        return;
    }

    list.innerHTML = logs.map(log => `
        <div class="log-item">
            <div class="log-icon"><i data-lucide="activity"></i></div>
            <div class="log-content">
                <div class="log-header">
                    <span class="log-action">${log.action}</span>
                    <span class="log-date">${log.date}</span>
                </div>
                <p class="log-details">${log.details}</p>
            </div>
            <div class="log-admin">por ${log.admin}</div>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

window.clearLogs = function() {
    if (confirm('Deseja realmente limpar todo o histórico de logs?')) {
        localStorage.setItem('wandeath_admin_logs', '[]');
        renderAdminLogs();
    }
};

// Admin Management Logic
function renderAdminsList() {
    const list = document.getElementById('admins-list');
    if (!list) return;
    const admins = JSON.parse(localStorage.getItem('wandeath_admins') || '[{"email":"admin@admin.com","pass":"admin"}]');
    
    list.innerHTML = admins.map((admin, index) => `
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); padding:12px 18px; border-radius:10px; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:32px; height:32px; background:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800;">${admin.email.charAt(0).toUpperCase()}</div>
                <div>
                    <div style="font-size:14px; font-weight:600;">${admin.email}</div>
                    <div style="font-size:11px; color:var(--text-sec);">Administrador</div>
                </div>
            </div>
            ${admin.email !== 'admin@admin.com' ? `
                <button onclick="removeAdmin(${index})" class="delete-prod-btn" style="width:30px; height:30px;">
                    <i data-lucide="user-minus" style="width:14px;"></i>
                </button>
            ` : '<span style="font-size:10px; color:var(--primary); font-weight:800; text-transform:uppercase;">Master</span>'}
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

window.addNewAdmin = function() {
    const email = document.getElementById('new-admin-email').value.trim();
    const pass = document.getElementById('new-admin-pass').value.trim();

    if (!email || !pass) return alert('Preencha e-mail e senha!');

    const admins = JSON.parse(localStorage.getItem('wandeath_admins') || '[{"email":"admin@admin.com","pass":"admin"}]');
    if (admins.find(a => a.email === email)) return alert('Este e-mail já é administrador!');

    admins.push({ email, pass });
    localStorage.setItem('wandeath_admins', JSON.stringify(admins));
    
    document.getElementById('new-admin-email').value = '';
    document.getElementById('new-admin-pass').value = '';

    addLog('Novo Admin Adicionado', `O e-mail ${email} foi promovido a administrador.`);
    renderAdminsList();
    alert('Novo administrador adicionado com sucesso!');
};

window.removeAdmin = function(index) {
    const admins = JSON.parse(localStorage.getItem('wandeath_admins') || '[{"email":"admin@admin.com","pass":"admin"}]');
    const removedEmail = admins[index].email;
    
    if (confirm(`Remover as permissões de admin de ${removedEmail}?`)) {
        admins.splice(index, 1);
        localStorage.setItem('wandeath_admins', JSON.stringify(admins));
        addLog('Admin Removido', `O administrador ${removedEmail} foi removido.`);
        renderAdminsList();
    }
};

window.addEventListener('storage', (e) => { if (e.key === 'wandeath_chat_history') { if (typeof renderAdminMessages === 'function') renderAdminMessages(); } });
