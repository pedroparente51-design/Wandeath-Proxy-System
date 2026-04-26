function addToCart(name, btn) {
    window.WandeathCart.add(name, 1, btn);
}

function processPurchase(name) {
    window.location.href = `/produto/?name=${encodeURIComponent(name)}`;
}

window.addToCart = addToCart;
window.processPurchase = processPurchase;

function getProductsByCategory(category) {
    let productsStr = localStorage.getItem('wandeath_products');
    let products = productsStr ? JSON.parse(productsStr) : [];
    
    if (products.length === 0) {
        products = [
            { name: "Proxy Residencial Rotativa", price: "13.99", category: "rotativa", image: "/img-rotativa/1gb.png", tag: "Mais vendido", description: "IPs residenciais rotativos com alta reputação e baixa detecção.", delivery: "proxy-rot:1234:user:pass", minQty: 1, maxQty: 100 },
            { name: "Proxy Mobile Premium", price: "27.79", category: "mobile", image: "/img-rotativa/3gb.png", tag: "Premium", description: "IPs móveis reais (4G/5G) para máxima autenticidade.", delivery: "proxy-mob:5678:user:pass", minQty: 1, maxQty: 50 },
            { name: "Proxy Residencial Fixa", price: "46.19", category: "fixa", image: "/img-rotativa/5gb.png", tag: "Contingência", description: "IPs dedicados e estáveis para operações de longa duração.", delivery: "proxy-fixa:9999:user:pass", minQty: 1, maxQty: 20 }
        ];
        localStorage.setItem('wandeath_products', JSON.stringify(products));
    }
    
    return products.filter(p => p.category === category);
}

function generateCardHTML(p) {
    const imgUrl = p.image || '/img-rotativa/1gb.png';
    const iconMap = {
        'rotativa': '🔄',
        'mobile': '📱',
        'fixa': '🏠',
        'datacenter': '🛜'
    };
    const icon = iconMap[p.category] || '📦';
    const shortDesc = p.description
        ? (p.description.length > 90 ? p.description.substring(0, 90) + '…' : p.description)
        : 'Solução premium para máxima performance.';

    return `
        <div class="product-card">
            <div class="product-tag">${p.tag || 'Novo'}</div>
            <div class="product-img">
                <img src="${imgUrl}" alt="${p.name}" onerror="this.src='/image.png'">
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
                <a href="/produto/?name=${encodeURIComponent(p.name)}"
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
        grid.innerHTML = products.length === 0 ? '<p style="color: var(--text-sec); padding: 40px; text-align: center; grid-column: 1/-1;">Nenhuma proxy rotativa cadastrada.</p>' : products.map(generateCardHTML).join('');
        if (window.lucide) lucide.createIcons();
    }
}

function renderMobile() {
    const grid = document.getElementById('mobile-grid');
    if (grid) {
        const products = getProductsByCategory('mobile');
        grid.innerHTML = products.length === 0 ? '<p style="color: var(--text-sec); padding: 40px; text-align: center; grid-column: 1/-1;">Nenhuma proxy mobile cadastrada.</p>' : products.map(generateCardHTML).join('');
        if (window.lucide) lucide.createIcons();
    }
}

function renderFixas() {
    const grid = document.getElementById('fixa-grid');
    if (grid) {
        const products = getProductsByCategory('fixa');
        grid.innerHTML = products.length === 0 ? '<p style="color: var(--text-sec); padding: 40px; text-align: center; grid-column: 1/-1;">Nenhuma proxy fixa cadastrada.</p>' : products.map(generateCardHTML).join('');
        if (window.lucide) lucide.createIcons();
    }
}

window.renderRotativas = renderRotativas;
window.renderMobile = renderMobile;
window.renderFixas = renderFixas;

window.addEventListener('storage', (e) => {
    if (e.key === 'wandeath_products') {
        if (document.getElementById('rotativa-grid')) renderRotativas();
        if (document.getElementById('mobile-grid')) renderMobile();
        if (document.getElementById('fixa-grid')) renderFixas();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('rotativa-grid')) renderRotativas();
    if (document.getElementById('mobile-grid')) renderMobile();
    if (document.getElementById('fixa-grid')) renderFixas();
    if (window.lucide) lucide.createIcons();
});
