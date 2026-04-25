function addToCart(name, btn) {
    const qtyInput = btn.closest('.product-footer').querySelector('.qty-input');
    const qty = parseInt(qtyInput.value) || 1;
    let cart = JSON.parse(localStorage.getItem('wandeath_cart') || '[]');
    const existing = cart.find(item => item.name === name);
    
    // Buscar price e image do produto para salvar junto
    const products = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
    const prod = products.find(p => p.name === name);
    const price = prod ? parseFloat(prod.price) : 0;
    const image = prod ? (prod.image || '../image.png') : '../image.png';

    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ name, qty, price, image });
    }
    
    localStorage.setItem('wandeath_cart', JSON.stringify(cart));
    if (window.updateCartBadge) window.updateCartBadge();
    
    // Animation/Feedback
    btn.innerHTML = 'Adicionado!';
    btn.style.background = '#00ff66';
    setTimeout(() => {
        btn.innerHTML = 'Carrinho';
        btn.style.background = '';
    }, 2000);
}

function processPurchase(name, btn) {
    const qtyInput = btn.closest('.product-footer').querySelector('.qty-input');
    const qty = parseInt(qtyInput.value) || 1;
    const products = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
    const product = products.find(p => p.name === name);
    
    if (!product) return;
    
    window.currentCheckout = { product, qty };
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.classList.add('show');
        // Update price in modal
        const total = product.price * qty;
        const totalBtn = document.getElementById('checkout-total-btn');
        if (totalBtn) totalBtn.innerText = `R$ ${total.toFixed(2)}`;
    }
}

window.addToCart = addToCart;
window.processPurchase = processPurchase;

// Fetch products from localStorage to sync with Admin
function getProductsByCategory(category) {
    let productsStr = localStorage.getItem('wandeath_products');
    let products = productsStr ? JSON.parse(productsStr) : [];
    
    // Sync default products if empty
    if (products.length === 0) {
        products = [
            { name: "Proxy Residencial Rotativa", price: "13.99", category: "rotativa", image: "../img-rotativa/1gb.png", tag: "Mais vendido", description: "IPs residenciais rotativos com alta reputação e baixa detecção.", delivery: "proxy-rot:1234:user:pass", minQty: 1, maxQty: 100 },
            { name: "Proxy Mobile Premium", price: "27.79", category: "mobile", image: "../img-rotativa/3gb.png", tag: "Premium", description: "IPs móveis reais (4G/5G) para máxima autenticidade.", delivery: "proxy-mob:5678:user:pass", minQty: 1, maxQty: 50 },
            { name: "Proxy Residencial Fixa", price: "46.19", category: "fixa", image: "../img-rotativa/5gb.png", tag: "Contingência", description: "IPs dedicados e estáveis para operações de longa duração.", delivery: "proxy-fixa:9999:user:pass", minQty: 1, maxQty: 20 }
        ];
        localStorage.setItem('wandeath_products', JSON.stringify(products));
    }
    
    return products.filter(p => p.category === category);
}

function generateCardHTML(p) {
    const imgUrl = p.image || '../img-rotativa/1gb.png';

    // Mapeamento de ícones por categoria
    const iconMap = {
        'rotativa': '🔄',
        'mobile': '📱',
        'fixa': '🏠',
        'datacenter': '🛜'
    };
    const icon = iconMap[p.category] || '📦';

    // Descrição curta para manter o alinhamento
    const shortDesc = p.description
        ? (p.description.length > 90 ? p.description.substring(0, 90) + '…' : p.description)
        : 'Solução premium para máxima performance.';

    return `
        <div class="product-card rx-reveal">
            <div class="product-tag">${p.tag || 'Novo'}</div>
            <div class="product-img">
                <img src="${imgUrl}" alt="${p.name}" onerror="this.src='../image.png'">
                <div class="img-overlay"></div>
            </div>
            <div class="product-content">
                <h4 class="product-title">${icon} ${p.name}</h4>
                <p class="product-desc">${shortDesc}</p>
                <div class="price-section">
                    <div class="price-info">
                        <p class="price-val">R$ ${parseFloat(p.price).toFixed(2)}</p>
                        <p class="price-label">À vista no Pix</p>
                    </div>
                    <div class="pix-badge"><span>☠</span></div>
                </div>
            </div>
            <div class="product-footer">
                <a href="../produto/produto.html?name=${encodeURIComponent(p.name)}"
                   class="btn-buy btn-shine">
                    Ver Produto
                </a>
            </div>
        </div>
    `;
}

function renderRotativas() {
    const grid = document.getElementById('rotativa-grid');
    if (grid) {
        const products = getProductsByCategory('rotativa');
        if (products.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-sec); padding: 40px; text-align: center; grid-column: 1/-1;">Nenhuma proxy rotativa cadastrada.</p>';
            return;
        }
        grid.innerHTML = products.map(generateCardHTML).join('');
        if (window.revealObserver) grid.querySelectorAll('.rx-reveal').forEach(el => window.revealObserver.observe(el));
        lucide.createIcons();
    }
}

function renderMobile() {
    const grid = document.getElementById('mobile-grid');
    if (grid) {
        const products = getProductsByCategory('mobile');
        if (products.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-sec); padding: 40px; text-align: center; grid-column: 1/-1;">Nenhuma proxy mobile cadastrada.</p>';
            return;
        }
        grid.innerHTML = products.map(generateCardHTML).join('');
        if (window.revealObserver) grid.querySelectorAll('.rx-reveal').forEach(el => window.revealObserver.observe(el));
        lucide.createIcons();
    }
}

function renderFixas() {
    const grid = document.getElementById('fixa-grid');
    if (grid) {
        const products = getProductsByCategory('fixa');
        if (products.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-sec); padding: 40px; text-align: center; grid-column: 1/-1;">Nenhuma proxy fixa cadastrada.</p>';
            return;
        }
        grid.innerHTML = products.map(generateCardHTML).join('');
        if (window.revealObserver) grid.querySelectorAll('.rx-reveal').forEach(el => window.revealObserver.observe(el));
        lucide.createIcons();
    }
}

window.renderRotativas = renderRotativas;
window.renderMobile = renderMobile;
window.renderFixas = renderFixas;

// --- Admin Sync Logic ---
window.addEventListener('storage', (e) => {
    if (e.key === 'wandeath_products') {
        if (document.getElementById('rotativa-grid')) renderRotativas();
        if (document.getElementById('mobile-grid')) renderMobile();
        if (document.getElementById('fixa-grid')) renderFixas();
    }
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('rotativa-grid')) renderRotativas();
    if (document.getElementById('mobile-grid')) renderMobile();
    if (document.getElementById('fixa-grid')) renderFixas();
    if (window.lucide) lucide.createIcons();
});
