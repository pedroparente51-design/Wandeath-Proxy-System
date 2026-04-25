const safeRun = (name, fn) => {
    try { 
        if (typeof fn === 'function') fn(); 
    } catch (e) { 
        console.error(`[Wandeath] Erro em ${name}:`, e); 
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        try { lucide.createIcons(); } catch(e) {}
    }
    
    safeRun('renderCart', renderCart);
    safeRun('initCheckoutActions', initCheckoutActions);
    
    // Neural Network & BG Effects (RH7 Standard)
    safeRun('initNeuralNetwork', initNeuralNetwork);
    safeRun('initInteractiveBackground', initInteractiveBackground);
    safeRun('initMouseGlow', initMouseGlow);
    
    // Refresh icons after render
    setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 200);
});

function initMouseGlow() {
    const glow = document.getElementById('mouse-glow');
    if (!glow) return;
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
}

function initInteractiveBackground() {
    const shapes = document.querySelectorAll('.parallax-shape');
    if (!shapes.length) return;
    window.addEventListener('mousemove', (e) => {
        const xOffset = (window.innerWidth / 2 - e.clientX) * 0.02;
        const yOffset = (window.innerHeight / 2 - e.clientY) * 0.02;
        shapes.forEach((shape, i) => {
            const speed = (i + 1) * 0.5;
            shape.style.transform = `translate(${xOffset * speed}px, ${yOffset * speed}px)`;
        });
    });
}

function initNeuralNetwork() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    let mouse = { x: -999, y: -999 };
    const COUNT = 80;
    const MAX_DIST = 150;

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.r = 1.5;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > W) this.vx *= -1;
            if (this.y < 0 || this.y > H) this.vy *= -1;
        }
        draw() {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(238, 0, 0, 0.5)'; ctx.fill();
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            p.update(); p.draw();
            particles.forEach(p2 => {
                const d = Math.hypot(p.x - p2.x, p.y - p2.y);
                if (d < MAX_DIST) {
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(238, 0, 0, ${0.15 * (1 - d / MAX_DIST)})`;
                    ctx.stroke();
                }
            });
            const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
            if (md < 200) {
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(238, 0, 0, ${0.4 * (1 - md / 200)})`;
                ctx.stroke();
            }
        });
        requestAnimationFrame(draw);
    }
    resize();
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());
    draw();
}

window.currentCoupon = null;

function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem('wandeath_cart') || '[]');
        return Array.isArray(cart) ? cart : [];
    } catch(e) {
        return [];
    }
}

function getProducts() {
    let products = [];
    try {
        let productsStr = localStorage.getItem('wandeath_products');
        products = productsStr ? JSON.parse(productsStr) : [];
    } catch (e) { console.error('[Wandeath] Erro ao carregar produtos:', e); }

    if (!Array.isArray(products) || products.length === 0) {
        products = [
            { name: "Proxy Residencial Rotativa", price: "13.99", category: "rotativa", image: "/img-rotativa/1gb.png" },
            { name: "Proxy Mobile Premium", price: "27.79", category: "mobile", image: "/img-rotativa/3gb.png" },
            { name: "Proxy Residencial Fixa", price: "46.19", category: "fixa", image: "/img-rotativa/5gb.png" }
        ];
        localStorage.setItem('wandeath_products', JSON.stringify(products));
    }
    return products;
}

function renderCart() {
    const list = document.getElementById('cart-items-list');
    const summaryList = document.getElementById('cart-summary-items');
    
    // Auto-corrigir carrinho corrompido
    let cart = getCart();
    let isCorrupted = false;
    cart = cart.filter(item => {
        if (!item || typeof item !== 'object' || !item.name) {
            isCorrupted = true;
            return false;
        }
        return true;
    });
    if (isCorrupted) {
        localStorage.setItem('wandeath_cart', JSON.stringify(cart));
        if (window.updateCartBadge) window.updateCartBadge();
    }

    const products = getProducts();

    if (!list) return;

    if (cart.length === 0) {
        list.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">
                    <i data-lucide="shopping-cart" style="width:36px; height:36px;"></i>
                </div>
                <h3>Seu carrinho está vazio</h3>
                <p>Explore nossos produtos e adicione proxies de alta qualidade.</p>
                <a href="/#produtos" class="btn-go-shop">
                    <i data-lucide="arrow-left" style="width:16px;"></i>
                    Ir para a Loja
                </a>
            </div>
        `;
        if (summaryList) summaryList.innerHTML = '<div style="font-size:12px; color:var(--text-sec); text-align:center; padding:20px;">Nenhum item adicionado</div>';
        const countBadge = document.querySelector('.item-count');
        if (countBadge) countBadge.textContent = '0 itens';
        updateTotals(0);
        if (window.lucide) lucide.createIcons();
        return;
    }

    // Update section header count safely
    const countBadge = document.querySelector('.item-count');
    const totalQty = cart.reduce((s, i) => s + (parseInt(i.qty) || 1), 0);
    if (countBadge) countBadge.textContent = totalQty + ' itens';

    list.innerHTML = '';
    if (summaryList) summaryList.innerHTML = '';

    let subtotal = 0;

    cart.forEach((item, index) => {
        const prod = products.find(p => p && p.name === item.name);
        const name  = item.name;
        const qty = parseInt(item.qty) || 1;
        let price = prod ? parseFloat(prod.price) : parseFloat(item.price);
        if (isNaN(price) || price <= 0) price = 10; // Fallback extremo
        
        const image = prod ? (prod.image || '/image.png') : (item.image || '/image.png');
        const category = prod ? (prod.category || '') : '';

        const totalItem = price * qty;
        subtotal += totalItem;

        const row = document.createElement('div');
        row.className = 'cart-item';
        row.style.animationDelay = `${index * 0.05}s`;
        row.innerHTML = `
            <img src="${image}" alt="${name}" onerror="this.src='/image.png'">
            <div class="info">
                ${category ? `<span class="cart-item-category">${category}</span>` : ''}
                <h5>${name}</h5>
                <div class="cart-item-qty">
                    <button onclick="updateQty(${index}, -1)">−</button>
                    <span>${qty}</span>
                    <button onclick="updateQty(${index}, 1)">+</button>
                </div>
            </div>
            <div class="price">
                <div class="price-amount">R$ ${totalItem.toFixed(2)}</div>
                <div class="price-unit">${qty}x R$ ${price.toFixed(2)}</div>
                <button class="cart-item-remove" onclick="removeItem(${index})" title="Remover">
                    <i data-lucide="trash-2" style="width:14px;"></i>
                </button>
            </div>
        `;
        list.appendChild(row);

        if (summaryList) {
            const sItem = document.createElement('div');
            sItem.className = 'summary-product-item';
            sItem.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="font-size:13px; font-weight:600; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${name}</span>
                    <span style="font-size:13px; font-weight:800;">R$ ${totalItem.toFixed(2)}</span>
                </div>
                <div style="font-size:11px; color:var(--text-sec);">${qty}x R$ ${price.toFixed(2)}</div>
            `;
            summaryList.appendChild(sItem);
        }
    });

    if (window.lucide) lucide.createIcons();
    updateTotals(subtotal);
}

function updateQty(index, delta) {
    const cart = getCart();
    cart[index].qty += delta;
    if (cart[index].qty < 1) cart[index].qty = 1;
    localStorage.setItem('wandeath_cart', JSON.stringify(cart));
    renderCart();
}

function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    localStorage.setItem('wandeath_cart', JSON.stringify(cart));
    renderCart();
}

function updateTotals(subtotal) {
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-final-total');
    const discountLine = document.getElementById('cart-discount-line');
    const discountEl = document.getElementById('cart-discount-val');

    let total = subtotal;
    let discountVal = 0;

    if (window.currentCoupon) {
        discountVal = (subtotal * window.currentCoupon.discount) / 100;
        total = subtotal - discountVal;
        
        if (discountLine) {
            discountLine.style.display = 'flex';
            discountEl.innerText = `- R$ ${discountVal.toFixed(2)}`;
        }
    } else {
        if (discountLine) discountLine.style.display = 'none';
    }

    if (subtotalEl) subtotalEl.innerText = `R$ ${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.innerText = `R$ ${total.toFixed(2)}`;
    
    window.lastTotal = total;
}

function applyCartCoupon() {
    const input = document.getElementById('cart-coupon-input');
    const msg = document.getElementById('coupon-msg');
    const code = input.value.trim().toUpperCase();

    if (!code) return;

    const coupons = JSON.parse(localStorage.getItem('wandeath_coupons') || '[]');
    const coupon = coupons.find(c => c.name === code);

    if (!coupon) {
        msg.innerText = '❌ Cupom inválido!';
        msg.style.color = '#ff4a4a';
        window.currentCoupon = null;
        renderCart();
        return;
    }

    if (coupon.type === 'limited' && coupon.usesLeft <= 0) {
        msg.innerText = '❌ Cupom esgotado!';
        msg.style.color = '#ff4a4a';
        window.currentCoupon = null;
        renderCart();
        return;
    }

    window.currentCoupon = coupon;
    msg.innerText = `✅ Cupom ${coupon.name} aplicado! (${coupon.discount}% off)`;
    msg.style.color = '#22c55e';
    renderCart();
}

function initCheckoutActions() {
    const confirmBtn = document.getElementById('confirm-payment-btn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const nameEl = document.getElementById('checkout-name');
            const emailEl = document.getElementById('checkout-email');
            
            if (!nameEl || !emailEl) return console.error('Campos de checkout não encontrados');
            
            const name = nameEl.value.trim();
            const email = emailEl.value.trim();
            
            if (!name || !email) {
                alert('Por favor, preencha seu nome e e-mail para receber os produtos.');
                return;
            }

            const cart = getCart();
            if (cart.length === 0) {
                alert('Seu carrinho está vazio.');
                return;
            }
            
            startPaymentProcess(name, email);
        };
    }
}

const MP_TOKEN = 'APP_USR-6939778403757007-042321-66d2bef7d6ee6c3d3c269703ab411f51-256063981';

async function startPaymentProcess(name, email) {
    const total = window.lastTotal;
    const cart = getCart();
    const grid = document.getElementById('main-checkout-grid');
    const originalContent = grid.innerHTML;

    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 100px 0;">
            <div class="loader" style="margin: 0 auto 30px;"></div>
            <h2 style="font-size:24px; margin-bottom:10px;">Processando Pagamento</h2>
            <p style="color: var(--text-sec);">Aguarde enquanto geramos seu QR Code PIX...</p>
        </div>
    `;

    try {
        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `cart-${Date.now()}`
            },
            body: JSON.stringify({
                transaction_amount: total,
                description: `Wandeath VIP - ${cart.length} itens no carrinho`,
                payment_method_id: 'pix',
                payer: {
                    email: email,
                    first_name: name.split(' ')[0],
                    last_name: name.split(' ').slice(1).join(' ') || 'Cliente',
                    identification: { type: 'CPF', number: '12345678909' }
                }
            })
        });

        const data = await response.json();
        if (!data.id) throw new Error(data.message || 'Falha ao conectar com Mercado Pago');

        const pix = data.point_of_interaction.transaction_data;
        const payId = data.id;

        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 20px 0;">
                <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 40px; max-width: 600px; margin: 0 auto;">
                    <h2 style="margin-bottom: 10px;">Pague com PIX</h2>
                    <p style="color: var(--text-sec); margin-bottom: 30px; font-size: 14px;">Escaneie o código abaixo ou copie o código "Copia e Cola".</p>
                    
                    <div style="background: #fff; padding: 20px; border-radius: 16px; display: inline-block; margin-bottom: 30px;">
                        <img src="data:image/png;base64,${pix.qr_code_base64}" style="width: 250px; height: 250px;">
                    </div>

                    <div style="margin-bottom: 30px; text-align: left;">
                        <label style="display: block; font-size: 11px; font-weight: 800; color: var(--text-sec); text-transform: uppercase; margin-bottom: 10px;">Código Copia e Cola</label>
                        <div style="display: flex; gap: 10px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); padding: 5px; border-radius: 10px;">
                            <input type="text" value="${pix.qr_code}" id="pix-raw-code" readonly style="flex: 1; background: transparent; border: none; color: #fff; padding: 12px; font-size: 13px; outline: none;">
                            <button onclick="copyPixCode()" style="background: var(--primary); color: #fff; border: none; padding: 0 25px; border-radius: 8px; font-weight: 800; cursor: pointer;">Copiar</button>
                        </div>
                    </div>

                    <div id="payment-status" style="display: flex; align-items: center; justify-content: center; gap: 12px; color: #22c55e; font-size: 14px; font-weight: 700;">
                        <div class="loader" style="width: 20px; height: 20px; border-width: 3px;"></div>
                        <span>Aguardando Pagamento...</span>
                    </div>
                </div>
            </div>
        `;

        window.copyPixCode = () => {
            const el = document.getElementById('pix-raw-code');
            el.select();
            document.execCommand('copy');
            alert('Código PIX copiado com sucesso!');
        };

        const poll = setInterval(async () => {
            const r = await fetch(`https://api.mercadopago.com/v1/payments/${payId}`, {
                headers: { 'Authorization': `Bearer ${MP_TOKEN}` }
            });
            const s = await r.json();
            if (s.status === 'approved') {
                clearInterval(poll);
                processOrderCompletion();
            }
        }, 5000);

    } catch (err) {
        alert('Erro ao processar: ' + err.message);
        grid.innerHTML = originalContent;
        renderCart();
    }
}

function processOrderCompletion() {
    const cart = getCart();
    const products = getProducts();
    const orders = JSON.parse(localStorage.getItem('wandeath_orders') || '[]');
    
    // Finalize each item
    cart.forEach(item => {
        const pIdx = products.findIndex(p => p.name === item.name);
        if (pIdx === -1) return;
        
        const lines = products[pIdx].delivery ? products[pIdx].delivery.trim().split('\n').filter(Boolean) : [];
        const delivered = lines.splice(0, item.qty);
        products[pIdx].delivery = lines.join('\n');
        
        orders.push({
            productName: item.name,
            delivery: delivered.join('\n'),
            date: Date.now(),
            qty: item.qty,
            total: (parseFloat(products[pIdx].price) * item.qty) * (window.currentCoupon ? (1 - window.currentCoupon.discount/100) : 1)
        });
    });

    localStorage.setItem('wandeath_products', JSON.stringify(products));
    localStorage.setItem('wandeath_orders', JSON.stringify(orders));
    localStorage.removeItem('wandeath_cart');

    window.location.href = '/pedidos/';
}

window.updateQty = updateQty;
window.removeItem = removeItem;
window.applyCartCoupon = applyCartCoupon;
