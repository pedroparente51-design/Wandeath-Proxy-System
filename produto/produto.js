/* 
   Wandeath VIP - Produto Detail Engine
   Extracted from inline HTML for better performance and organization.
*/

document.addEventListener('DOMContentLoaded', () => {
    init();
    if (window.lucide) lucide.createIcons();
});

function init() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const products = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
    const prod = products.find(p => p.name === name);

    if (!prod) {
        window.location.href = '/';
        return;
    }

    const titleEl = document.getElementById('prod-title');
    const imgEl = document.getElementById('prod-img');
    const priceEl = document.getElementById('prod-price');
    const descEl = document.getElementById('prod-desc');
    const stockEl = document.getElementById('prod-stock');

    if (titleEl) titleEl.innerText = prod.name;
    if (imgEl) imgEl.src = prod.image || '/logo.png';
    if (priceEl) priceEl.innerText = `R$ ${parseFloat(prod.price).toFixed(2)}`;
    if (descEl) descEl.innerText = prod.description;

    const stock = prod.delivery ? prod.delivery.trim().split('\n').filter(Boolean).length : 0;
    if (stockEl) stockEl.innerText = `${stock} EM ESTOQUE`;

    // Video Tutorial Handling
    const videoWrapper = document.querySelector('.prod-video-wrapper');
    if (videoWrapper) {
        if (prod.youtubeUrl) {
            // Convert watch URL to embed URL
            let videoId = '';
            if (prod.youtubeUrl.includes('v=')) {
                videoId = prod.youtubeUrl.split('v=')[1].split('&')[0];
            } else if (prod.youtubeUrl.includes('youtu.be/')) {
                videoId = prod.youtubeUrl.split('youtu.be/')[1].split('?')[0];
            }

            if (videoId) {
                videoWrapper.style.display = 'block';
                videoWrapper.style.background = '#000';
                videoWrapper.innerHTML = `
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        title="YouTube video player" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowfullscreen
                        style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                    </iframe>
                `;
            } else {
                videoWrapper.style.display = 'none';
            }
        } else {
            videoWrapper.style.display = 'none';
        }
    }
    if (window.lucide) lucide.createIcons();

    renderSimilar(products, prod.name);
    updateCartBadge();
}

function renderSimilar(products, currentName) {
    const grid = document.getElementById('similar-grid');
    if (!grid) return;

    const similar = products.filter(p => p.name !== currentName).slice(0, 5);

    grid.innerHTML = similar.map(p => `
        <a href="/produto/?name=${encodeURIComponent(p.name)}" class="similar-card">
            <img src="${p.image || '/logo.png'}" alt="${p.name}" onerror="this.src='/image.png'">
            <h5>🛜 ${p.name.replace('Proxy Residencial Rotativa BR - ', '')}</h5>
            <div class="sim-price">R$ ${parseFloat(p.price).toFixed(2)}</div>
            <div class="sim-sub">À vista no Pix</div>
            <button class="btn-sim-buy">Comprar agora</button>
        </a>
    `).join('');
}

window.addToCart = function() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const products = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
    const prod = products.find(p => p.name === name);
    
    if (!prod) return;

    const price = parseFloat(prod.price) || 0;
    const image = prod.image || '/image.png';
    
    let cart = JSON.parse(localStorage.getItem('wandeath_cart') || '[]');
    const item = cart.find(i => i.name === name);
    
    if (item) {
        item.qty++;
    } else {
        cart.push({ name, qty: 1, price, image });
    }
    
    localStorage.setItem('wandeath_cart', JSON.stringify(cart));
    updateCartBadge();
    alert('Adicionado ao carrinho!');
};

window.buyNow = function() {
    window.addToCart();
    window.location.href = '/carrinho/';
};

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('wandeath_cart') || '[]');
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.innerText = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}
