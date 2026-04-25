const safeRun = (name, fn) => {
    try { 
        if (typeof fn === 'function') {
            fn(); 
        } else {
            // Silencioso se for opcional
        }
    } catch (e) { 
        console.error(`[Wandeath] Erro em ${name}:`, e); 
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const isHomePage = document.getElementById('products-grid') !== null || document.querySelector('.faq-list') !== null;
    
    if (window.lucide) lucide.createIcons();

    // Funções comuns a todas as páginas
    safeRun('checkLoginState', checkLoginState);
    safeRun('renderHeaderMenu', renderHeaderMenu);
    safeRun('updateCartBadge', updateCartBadge);
    safeRun('initSearch', initSearch);
    safeRun('initModals', initModals);

    // Funções específicas da Home
    if (isHomePage) {
        safeRun('initMouseGlow', initMouseGlow);
        safeRun('initScrollReveal', initScrollReveal);
        safeRun('initScrollProgress', initScrollProgress);
        safeRun('initNeuralNetwork', initNeuralNetwork);
        safeRun('initInteractiveBackground', initInteractiveBackground);
        safeRun('initFAQ', initFAQ);
        safeRun('renderStoreProducts', renderStoreProducts);
        safeRun('initProductTabs', initProductTabs);
        safeRun('initOrdersModal', initOrdersModal);
        safeRun('initCheckout', initCheckout);
        safeRun('initCheckerTabs', initCheckerTabs);
    }
    
    // Refresh icons
    if (window.lucide) lucide.createIcons();
    
    updateCartBadge();

    window.addEventListener('storage', (e) => {
        if (e.key === 'wandeath_products' && isHomePage) {
            safeRun('renderStoreProducts', renderStoreProducts);
            renderHeaderMenu();
        }
        if (e.key === 'wandeath_cart') {
            updateCartBadge();
        }
    });

    console.log(`[Wandeath] Sistema inicializado na página: ${window.location.pathname}`);

    // Segurança: Forçar revelação se o observer falhar
    setTimeout(() => {
        if (window.lucide) lucide.createIcons();
        document.querySelectorAll('.rx-reveal:not(.rx-reveal--visible)').forEach(el => {
            el.classList.add('rx-reveal--visible');
        });
    }, 1500);
});

/**
 * Recupera os produtos do localStorage ou inicializa com os padrões se estiver vazio.
 */
function getStoredProducts() {
    let products = [];
    try {
        let productsStr = localStorage.getItem('wandeath_products');
        products = productsStr ? JSON.parse(productsStr) : [];
    } catch (e) {
        console.error('[Wandeath] Erro ao carregar produtos:', e);
    }

    if (!Array.isArray(products) || products.length === 0) {
        products = [
            {
                name: "Proxy Residencial Rotativa",
                price: "13.99",
                category: "rotativa",
                image: "img-rotativa/1gb.png",
                tag: "MAIS VENDIDO",
                description: "IPs residenciais rotativos com alta reputação e baixa detecção. Ideal para operações em massa.",
                delivery: "187.12.44.1:8080:wandeath_user:pass123\n187.12.44.2:8080:wandeath_user:pass123",
                minQty: 1,
                maxQty: 100
            },
            { name: "Proxy Mobile Premium", price: "27.79", category: "mobile", image: "img-rotativa/3gb.png", tag: "Premium", description: "IPs móveis reais (4G/5G) para máxima autenticidade e alta taxa de sucesso.", delivery: "proxy-mob:5678:user:pass", minQty: 1, maxQty: 50 },
            { name: "Proxy Residencial Fixa", price: "46.19", category: "fixa", image: "img-rotativa/5gb.png", tag: "Contingência", description: "IPs dedicados e estáveis para operações de longa duração e alta confiabilidade.", delivery: "proxy-fixa:9999:user:pass", minQty: 1, maxQty: 20 }
        ];
        localStorage.setItem('wandeath_products', JSON.stringify(products));
    }
    return products;
}

/**
 * Renderiza dinamicamente o menu de produtos no Header
 */
function renderHeaderMenu() {
    const menu = document.getElementById('header-products-menu');
    if (!menu) return;

    const products = getStoredProducts();
    
    const prefix = '/';

    // 1. Links das Categorias Fixas
    let menuHTML = `
        <div style="padding: 10px 0;">
            <div style="font-size: 10px; color: var(--text-sec); font-weight: 800; padding: 5px 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Categorias</div>
            <a href="${prefix}proxy/proxyrotativa.html"><i data-lucide="refresh-cw" style="width:14px; margin-right:8px; color:var(--primary);"></i> Proxy Residencial Rotativa</a>
            <a href="${prefix}proxy/proxymobile.html"><i data-lucide="smartphone" style="width:14px; margin-right:8px; color:var(--primary);"></i> Proxy Mobile Premium</a>
            <a href="${prefix}proxy/proxyfixa.html"><i data-lucide="home" style="width:14px; margin-right:8px; color:var(--primary);"></i> Proxy Residencial Fixa</a>
            
            <div style="border-top: 1px solid rgba(255,255,255,0.05); margin: 10px 0;"></div>
    `;

    if (products.length > 0) {
        menuHTML += `<div style="font-size: 10px; color: var(--text-sec); font-weight: 800; padding: 5px 20px; text-transform: uppercase; letter-spacing: 1px;">Destaques</div>`;
        // Mostrar os 5 primeiros produtos como destaques no menu
        const mainProducts = products.slice(0, 5);
        menuHTML += mainProducts.map(p => `
            <a href="/produto/produto.html?name=${encodeURIComponent(p.name)}" style="font-size: 13px;">
                <i data-lucide="zap" style="width:14px; margin-right:8px; color:var(--primary);"></i> ${p.name}
            </a>
        `).join('');
    }

    menuHTML += `
            <div style="border-top: 1px solid rgba(255,255,255,0.05); margin: 10px 0;"></div>
            <a href="${prefix}index.html#produtos" style="color: var(--primary); font-weight: 800; text-align: center; background: rgba(238,0,0,0.05);">
                <i data-lucide="plus-circle" style="width:14px; margin-right:8px;"></i> Ver Todos
            </a>
        </div>
    `;

    menu.innerHTML = menuHTML;
    
    // Forçar Lucide a processar os novos ícones se necessário
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
}

function initSearch() {
    // A busca agora é tratada majoritariamente pelo initSearchSuggestions para mostrar o dropdown.
    // Esta função pode ser mantida para busca via "Enter" se desejar, mas vamos desativar a atualização em tempo real no grid para não "quebrar" os destaques.
    const searchInputs = document.querySelectorAll('.search-pill input');

    searchInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const term = e.target.value.toLowerCase().trim();
                const grid = document.getElementById('products-grid');
                if (!grid || !term) return;

                const allProducts = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
                const results = allProducts.filter(p =>
                    p.name.toLowerCase().includes(term) ||
                    p.category.toLowerCase().includes(term)
                );

                grid.innerHTML = '';
                grid.classList.remove('featured-layout');

                if (results.length === 0) {
                    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-sec); padding: 40px;">Nenhum produto encontrado para "' + term + '".</p>';
                    return;
                }

                results.forEach(prod => {
                    const imgUrl = prod.image || 'https://via.placeholder.com/400x533/000/fff?text=Wandeath+VIP';
                    const tagHtml = prod.tag ? `<div class="product-tag">${prod.tag}</div>` : '';
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card rx-reveal';
                    productCard.innerHTML = `
                        ${tagHtml}
                        <div class="product-img">
                            <img src="${imgUrl}" alt="${prod.name}" onerror="this.src='../logo.png'">
                            <div class="img-overlay"></div>
                        </div>
                        <div class="product-content">
                            <h4 class="product-title">🛜 ${prod.name}</h4>
                            <div class="price-section">
                                <div class="price-info">
                                    <p class="price-val">R$ ${parseFloat(prod.price).toFixed(2)}</p>
                                    <p class="price-label">À vista no Pix</p>
                                </div>
                            </div>
                        </div>
                        <div class="product-footer" style="padding: 15px; margin-top: auto;">
                            <button class="btn-buy btn-shine" style="width: 100%; padding: 12px; background: var(--primary); border: none; border-radius: 8px; color: #fff; font-weight: 800; cursor: pointer;" onclick="processPurchase('${prod.name}')">Comprar agora</button>
                        </div>
                    `;
                    grid.appendChild(productCard);
                    setTimeout(() => productCard.classList.add('rx-reveal--visible'), 10);
                });
            }
        });
    });
}

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

    // Coupon Logic Integration
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    if (applyCouponBtn) {
        applyCouponBtn.onclick = () => {
            const code = document.getElementById('checkout-coupon').value.trim().toUpperCase();
            const msg = document.getElementById('coupon-msg');
            if (!code) return;

            const coupons = JSON.parse(localStorage.getItem('wandeath_coupons') || '[]');
            const coupon = coupons.find(c => c.name === code);

            if (!coupon) {
                msg.textContent = '❌ Cupom inválido';
                msg.style.color = '#ff4a4a';
                msg.style.display = 'block';
                window.appliedCoupon = null;
            } else if (coupon.type === 'limited' && coupon.usesLeft <= 0) {
                msg.textContent = '❌ Cupom esgotado';
                msg.style.color = '#ff4a4a';
                msg.style.display = 'block';
                window.appliedCoupon = null;
            } else {
                msg.textContent = `✅ Desconto de ${coupon.discount}% aplicado!`;
                msg.style.color = '#4ade80';
                msg.style.display = 'block';
                window.appliedCoupon = coupon;
            }
            
            // Re-calc display total
            if (window.currentCheckout) {
                const { product, qty } = window.currentCheckout;
                let total = product.price * qty;
                if (window.appliedCoupon) {
                    total = total * (1 - window.appliedCoupon.discount / 100);
                }
                const totalBtn = document.getElementById('checkout-total-btn');
                const finalTotal = document.getElementById('final-total');
                if (totalBtn) totalBtn.innerText = `R$ ${total.toFixed(2)}`;
                if (finalTotal) finalTotal.innerText = `R$ ${total.toFixed(2)}`;
            }
        };
    }
}

function initOrdersModal() {
    const modal = document.getElementById('orders-modal');
    if (!modal) {
        // Fallback: define global open function for the redirect
        window.wandeathOpenOrders = (e) => {
            if (e) e.preventDefault();
            window.location.href = './pedidos/pedidos.html';
        };
        return;
    }
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

    const products = getStoredProducts();

    // Filter logic

    // Filter logic
    let filteredProducts = [];
    if (!Array.isArray(products)) {
        console.error('[Wandeath] Products is not an array:', products);
        return;
    }

    if (filter === 'all') {
        filteredProducts = products;
        grid.classList.add('featured-layout');
    } else {
        filteredProducts = products.filter(p => p && p.category === filter);
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

        // Descrição curta
        const shortDesc = prod.description
            ? (prod.description.length > 90 ? prod.description.substring(0, 90) + '…' : prod.description)
            : 'Solução premium para máxima performance.';

        // Mapeamento de ícones por categoria
        const iconMap = {
            'rotativa': '🔄',
            'mobile': '📱',
            'fixa': '🏠',
            'datacenter': '🛜'
        };
        const icon = iconMap[prod.category] || '📦';

        productCard.innerHTML = `
            ${tagHtml}
            <div class="product-img">
                <img src="${imgUrl}" alt="${prod.name}" onerror="this.src='./logo.png'">
                <div class="img-overlay"></div>
            </div>
            <div class="product-content">
                <h4 class="product-title">${icon} ${prod.name}</h4>
                <p class="product-desc">${shortDesc}</p>
                <div class="price-section">
                    <div class="price-info">
                        <p class="price-val">R$ ${parseFloat(prod.price).toFixed(2)}</p>
                        <p class="price-label">À vista no Pix</p>
                    </div>
                    <div class="pix-badge"><span>☠</span></div>
                </div>
            </div>
            <div class="product-footer">
                <a href="/produto/produto.html?name=${encodeURIComponent(prod.name)}"
                   class="btn-buy btn-shine">
                    Ver Produto
                </a>
            </div>
        `;
        grid.appendChild(productCard);
        
        // Forçar visibilidade se o observer falhar ou para feedback imediato
        setTimeout(() => productCard.classList.add('rx-reveal--visible'), 100);

        if (window.revealObserver) window.revealObserver.observe(productCard);
    });

    if (window.lucide) lucide.createIcons();
}

function processPurchase(name) {
    window.location.href = `/produto/produto.html?name=${encodeURIComponent(name)}`;
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
    // Sempre mostrar se houver itens, ou opcionalmente mostrar 0 se preferir
    if (count > 0) {
        badge.style.display = 'flex';
        badge.style.background = 'var(--primary)';
        badge.style.opacity = '1';
    } else {
        badge.style.display = 'none'; // Ou 'flex' se quiser a bolinha com 0
    }
}

window.updateCartBadge = updateCartBadge;

window.logout = function () {
    localStorage.removeItem('wandeath_user');
    window.location.reload();
};


function renderUserOrders() {
    const list = document.getElementById('my-orders-list');
    if (!list) return;

    // 1. Get current logged-in user
    const userDataStr = localStorage.getItem('wandeath_user');
    if (!userDataStr) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-sec); padding: 40px;">Por favor, faça login para ver seus pedidos.</p>';
        return;
    }
    const currentUser = JSON.parse(userDataStr);

    // 2. Load and Filter orders
    const allOrders = JSON.parse(localStorage.getItem('wandeath_orders') || '[]');
    const userOrders = allOrders.filter(order => order.customerEmail === currentUser.email);

    if (userOrders.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-sec); padding: 40px;">Você ainda não possui pedidos registrados neste e-mail.</p>';
        return;
    }

    list.innerHTML = userOrders.reverse().map(order => `
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
    let total = parseFloat(product.price) * qty;

    // Apply Discount if coupon is valid
    if (window.appliedCoupon) {
        total = total * (1 - window.appliedCoupon.discount / 100);
    }

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
                    
                    // Update Coupon usage if applied
                    if (window.appliedCoupon) {
                        const coupons = JSON.parse(localStorage.getItem('wandeath_coupons') || '[]');
                        const idx = coupons.findIndex(c => c.name === window.appliedCoupon.name);
                        if (idx !== -1) {
                            if (coupons[idx].type === 'limited') {
                                coupons[idx].usesLeft = Math.max(0, coupons[idx].usesLeft - 1);
                            }
                            coupons[idx].usedCount = (coupons[idx].usedCount || 0) + 1;
                            localStorage.setItem('wandeath_coupons', JSON.stringify(coupons));
                        }
                        window.appliedCoupon = null; // Clear after use
                    }

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
                <button onclick="closeCheckoutModal()"
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
            <span style="font-size:11px; font-weight:800; color:var(--text-sec); min-width:20px;">${i + 1}</span>
            <span style="flex:1; font-family:monospace; font-size:13px; color:#ccc; word-break:break-all;">${line}</span>
            <button onclick="copyToClipboard('${line.replace(/'/g, "\\'")}', this)" style="background:none; border:none; color:var(--text-sec); cursor:pointer; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700;">Copiar</button>
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
                    <button onclick="copyToClipboard('${allText.replace(/'/g, "\\'")}', this)" style="background:rgba(238,0,0,0.1); border:1px solid rgba(238,0,0,0.2); color:var(--primary); padding:6px 14px; border-radius:8px; font-size:11px; font-weight:800; cursor:pointer;">Copiar tudo</button>
                </div>
                <div style="max-height: 250px; overflow-y: auto; padding-right: 5px;">
                    ${itemsHtml}
                </div>
            </div>

            <div style="margin-top: 30px; display:flex; gap:15px; justify-content:center;">
                <button onclick="closeCheckoutModal(true)" 
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

window.copyToClipboard = function (text, btn) {
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


window.copyPixCode = function () {
    const input = document.getElementById('pix-copy-input');
    if (input) {
        input.select();
        document.execCommand('copy');
        alert('Código PIX copiado!');
    }
};

window.simulatePaymentSuccess = function () {
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
        const total = window.appliedCoupon ? (subtotal * (1 - window.appliedCoupon.discount / 100)) : subtotal;

        const customerName = document.getElementById('checkout-name')?.value || 'Visitante';
        const customerEmail = document.getElementById('checkout-email')?.value || 'N/A';

        const orders = JSON.parse(localStorage.getItem('wandeath_orders') || '[]');
        orders.push({
            productName: prod.name,
            delivery: deliveredItems.join('\n'),
            date: Date.now(),
            qty: qty,
            total: total,
            customerName,
            customerEmail
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
async function checkLoginState() {
    // 1. Sync with Supabase Session
    if (window.supabaseClient) {
        try {
            // Ouvir mudanças de autenticação (captura o login do OAuth)
            window.supabaseClient.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                    if (session && session.user) {
                        localStorage.setItem('wandeath_logged_in', 'true');
                        localStorage.setItem('wandeath_user', JSON.stringify({
                            name: session.user.user_metadata.full_name || session.user.email.split('@')[0],
                            email: session.user.email,
                            avatar: session.user.user_metadata.avatar_url
                        }));
                        renderHeaderMenu();
                    }
                }
                if (event === 'SIGNED_OUT') {
                    localStorage.removeItem('wandeath_logged_in');
                    localStorage.removeItem('wandeath_user');
                    window.location.reload();
                }
            });

            const { data: { session } } = await window.supabaseClient.auth.getSession();
            if (session && session.user) {
                localStorage.setItem('wandeath_logged_in', 'true');
                localStorage.setItem('wandeath_user', JSON.stringify({
                    name: session.user.user_metadata.full_name || session.user.email.split('@')[0],
                    email: session.user.email,
                    avatar: session.user.user_metadata.avatar_url
                }));
            }
        } catch (e) {
            console.warn('[Wandeath] Supabase Session Error:', e);
        }
    }

    // Se já estiver renderizado o menu de perfil, não faz nada para evitar duplicação
    if (document.querySelector('.profile-dropdown')) return;

    const isLoggedIn = localStorage.getItem('wandeath_logged_in');
    const userDataStr = localStorage.getItem('wandeath_user');
    const userBtn = document.querySelector('.header-user-btn');

    if (isLoggedIn === 'true' && userBtn) {
        let name = "Usuário";
        let avatarText = "U";
        if (userDataStr) {
            try {
                const user = JSON.parse(userDataStr);
                if (user && user.name) {
                    name = user.name.split(' ')[0]; // Nome curto
                    avatarText = name.charAt(0).toUpperCase();
                }
            } catch (e) { }
        }

        const isSubDir = window.location.pathname.includes('/produto/') || 
                         window.location.pathname.includes('/login/') || 
                         window.location.pathname.includes('/pedidos/') || 
                         window.location.pathname.includes('/carrinho/') || 
                         window.location.pathname.includes('/proxy/');
        const prefix = isSubDir ? '../' : './';
        const admins = JSON.parse(localStorage.getItem('wandeath_admins') || '[{"email":"admin@admin.com","pass":"admin"}]');
        const userObj = userDataStr ? JSON.parse(userDataStr) : null;
        const isAdmin = userObj && admins.find(a => a.email === userObj.email);

        // Substituir o botão de login pelo menu de perfil premium
        const profileDiv = document.createElement('div');
        profileDiv.className = 'nav-dropdown profile-dropdown';
        profileDiv.innerHTML = `
            <a href="javascript:void(0);" class="dropdown-toggle" style="display: flex; align-items: center; gap: 10px; color: #fff; text-decoration: none;">
                <div class="user-avatar-circle">
                    ${avatarText}
                </div>
                <div style="display: flex; align-items: center; gap: 6px; white-space: nowrap; font-size: 14px; font-weight: 600;">
                    Olá, ${name} 
                    <i data-lucide="chevron-down" style="width: 14px; color: var(--text-sec);"></i>
                </div>
            </a>
            <div class="dropdown-menu">
                ${isAdmin ? `
                <a href="/admin/" style="color: var(--primary); font-weight: 800;">
                    <i data-lucide="shield-check"></i> Painel Admin
                </a>
                <div style="border-top: 1px solid rgba(255,255,255,0.05); margin: 5px 0;"></div>
                ` : ''}
                <a href="${prefix}pedidos/pedidos.html">
                    <i data-lucide="package"></i> Meus Pedidos
                </a>
                <a href="#" onclick="window.wandeathLogout(event)" style="color: #ff4a4a;">
                    <i data-lucide="log-out"></i> Sair da conta
                </a>
            </div>
        `;

        userBtn.parentNode.replaceChild(profileDiv, userBtn);

        if (typeof lucide !== 'undefined') lucide.createIcons();

        window.wandeathLogout = async function (e) {
            if (e) e.preventDefault();
            if (confirm('Tem certeza que deseja sair?')) {
                try {
                    if (window.supabaseClient) await window.supabaseClient.auth.signOut();
                } catch (err) { console.error('SignOut error:', err); }
                
                localStorage.removeItem('wandeath_logged_in');
                localStorage.removeItem('wandeath_user');
                window.location.reload();
            }
        };

        window.goToPaymentStep = function () {
            document.getElementById('checkout-step-info').style.display = 'none';
            document.getElementById('checkout-step-payment').style.display = 'grid';
            if (window.lucide) lucide.createIcons();
        };

        window.backToInfoStep = function () {
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
    }, { threshold: 0.01, rootMargin: '0px 0px -20px 0px' });

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
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;

        question.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar bolha
            const isActive = item.classList.contains('active');

            // Fecha todos os outros para um efeito acordeão limpo
            faqItems.forEach(i => i.classList.remove('active'));

            // Se o clicado não estava ativo, abre ele
            if (!isActive) {
                item.classList.add('active');
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


function initModals() {
    // Modal Close Buttons
    const closeCheckoutBtn = document.getElementById('close-checkout-btn');
    if (closeCheckoutBtn) {
        closeCheckoutBtn.onclick = () => {
            const modal = document.getElementById('checkout-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        };
    }

    // Close on overlay click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

function initCheckerTabs() {
    // Checker Tabs
    const checkerTabs = document.querySelectorAll('.checker-tab-btn');
    checkerTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab');
            
            // Toggle active state
            document.querySelectorAll('.checker-tab-btn').forEach(b => b.classList.remove('active'));
            tab.classList.add('active');

            // Show target content
            document.querySelectorAll('.checker-tab-content').forEach(c => c.style.display = 'none');
            const target = document.getElementById(targetId);
            if (target) target.style.display = 'block';
        });
    });
}



function closeCheckoutModal(reload = false) {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    if (reload) window.location.reload();
}
window.closeCheckoutModal = closeCheckoutModal;
