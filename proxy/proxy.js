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
            { name: "Residencial Rotativa", price: "9.19", category: "rotativa", image: "../img-rotativa/1gb.png", tag: "Mais utilizado", description: "IPs residenciais com alta reputação.", delivery: "proxy-rot:1234:user:pass", minQty: 1, maxQty: 100 },
            { name: "Rotativa Mobile Premium", price: "27.79", category: "rotativa", image: "../img-rotativa/3gb.png", tag: "Premium", description: "IPs móveis reais (4G/5G).", delivery: "proxy-mob:5678:user:pass", minQty: 1, maxQty: 50 },
            { name: "Residencial Fixa", price: "46.19", category: "fixa", image: "../img-rotativa/5gb.png", tag: "Contingência", description: "IPs dedicados estáveis.", delivery: "proxy-fixa:9999:user:pass", minQty: 1, maxQty: 20 }
        ];
        localStorage.setItem('wandeath_products', JSON.stringify(products));
    }
    
    return products.filter(p => p.category === category);
}

function generateCardHTML(p) {
    const imgUrl = p.image || '../img-rotativa/1gb.png';
    const stockLines = p.delivery ? p.delivery.trim().split('\n') : [];
    const stockCount = stockLines.length;

    return `
        <div class="product-card rx-reveal">
            <div class="product-tag">Destaque</div>
            <div class="product-img">
                <img src="${imgUrl}" alt="${p.name}" onerror="this.src='../image.png'">
                <div class="img-overlay"></div>
            </div>
            <div class="product-content">
                <h4 class="product-title">🛜 ${p.name}</h4>
                <p class="product-desc">${p.description || 'Solução premium para máxima performance.'}</p>
                <div class="stock-info" style="font-size: 11px; margin: 10px 0; display: flex; justify-content: space-between;">
                    <span style="color: ${stockCount > 0 ? '#00ff66' : '#ff4a4a'}">Estoque: ${stockCount}</span>
                    <span style="color: var(--text-sec)">Mín: ${p.minQty || 1}</span>
                </div>
                <div class="price-section">
                    <div class="price-info">
                        <p class="price-val">R$ ${parseFloat(p.price).toFixed(2)}</p>
                        <p class="price-label">À vista no Pix</p>
                    </div>
                    <div class="pix-badge"><span>☠</span></div>
                </div>
            </div>
            <div class="product-footer" style="display: flex; gap: 8px; align-items: center; padding: 15px;">
                <input type="number" class="qty-input" value="${p.minQty || 1}" min="${p.minQty || 1}" max="${p.maxQty || 100}" 
                    style="width: 55px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: #fff; padding: 10px; border-radius: 8px; font-size: 12px;">
                <button class="btn-buy" style="padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: #fff; cursor: pointer;" onclick="addToCart('${p.name}', this)">Carrinho</button>
                <button class="btn-buy btn-shine" style="flex: 1; padding: 10px; background: var(--primary); border: none; border-radius: 8px; color: #fff; font-weight: 800; cursor: pointer;" onclick="processPurchase('${p.name}', this)">Comprar</button>
            </div>
        </div>
    `;
}

function renderRotativas() {
    console.log('Rendering Rotativas...');
    const grid = document.getElementById('rotativa-grid');
    if (grid) {
        const products = getProductsByCategory('rotativa');
        console.log('Found rotativa products:', products.length);
        
        if (products.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-sec); padding: 40px; text-align: center; grid-column: 1/-1;">Nenhuma proxy rotativa cadastrada.</p>';
            return;
        }
        grid.innerHTML = products.map(generateCardHTML).join('');
        if (window.revealObserver) {
            grid.querySelectorAll('.rx-reveal').forEach(el => window.revealObserver.observe(el));
        }
        lucide.createIcons();
    }
}

function renderFixas() {
    console.log('Rendering Fixas...');
    const grid = document.getElementById('fixa-grid');
    if (grid) {
        const products = getProductsByCategory('fixa');
        console.log('Found fixa products:', products.length);

        if (products.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-sec); padding: 40px; text-align: center; grid-column: 1/-1;">Nenhuma proxy fixa cadastrada.</p>';
            return;
        }
        grid.innerHTML = products.map(generateCardHTML).join('');
        if (window.revealObserver) {
            grid.querySelectorAll('.rx-reveal').forEach(el => window.revealObserver.observe(el));
        }
        lucide.createIcons();
    }
}
