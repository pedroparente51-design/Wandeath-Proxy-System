// Wandeath VIP - Carrinho Engine
// safeRun é provido pelo home.js

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        try { lucide.createIcons(); } catch(e) {}
    }
    
    window.safeRun('renderCart', renderCart);
    window.safeRun('initCheckoutActions', initCheckoutActions);
    
    // Neural Network & BG Effects (RH7 Standard)
    window.safeRun('initNeuralNetwork', initNeuralNetwork);
    window.safeRun('initInteractiveBackground', initInteractiveBackground);
    window.safeRun('initMouseGlow', initMouseGlow);
    
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

function renderCart() {
    const list = document.getElementById('cart-items-list');
    const summaryList = document.getElementById('cart-summary-items');
    if (!list) return;

    const cart = window.WandeathCart.get();
    
    if (cart.length === 0) {
        list.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon"><i data-lucide="shopping-cart"></i></div>
                <h3>Seu carrinho está vazio</h3>
                <p>Explore nossos produtos e adicione proxies de alta qualidade.</p>
                <a href="/#produtos" class="btn-go-shop"><i data-lucide="arrow-left"></i> Ir para a Loja</a>
            </div>
        `;
        if (summaryList) summaryList.innerHTML = '<div style="font-size:12px; color:var(--text-sec); text-align:center; padding:20px;">Nenhum item adicionado</div>';
        const countBadge = document.querySelector('.item-count');
        if (countBadge) countBadge.textContent = '0 itens';
        updateTotals(0);
        if (window.lucide) lucide.createIcons();
        return;
    }

    const countBadge = document.querySelector('.item-count');
    const totalQty = cart.reduce((s, i) => s + (parseInt(i.qty) || 1), 0);
    if (countBadge) countBadge.textContent = totalQty + ' itens';

    list.innerHTML = '';
    if (summaryList) summaryList.innerHTML = '';

    let subtotal = 0;

    cart.forEach((item, index) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.qty) || 1;
        const totalItem = price * qty;
        subtotal += totalItem;

        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <img src="${item.image || '/image.png'}" alt="${item.name}" onerror="this.src='/image.png'">
            <div class="info">
                <h5>${item.name}</h5>
                <div class="cart-item-qty">
                    <button onclick="window.WandeathCart.updateQty(${index}, -1)">−</button>
                    <span>${qty}</span>
                    <button onclick="window.WandeathCart.updateQty(${index}, 1)">+</button>
                </div>
            </div>
            <div class="price">
                <div class="price-amount">R$ ${totalItem.toFixed(2)}</div>
                <div class="price-unit">${qty}x R$ ${price.toFixed(2)}</div>
                <button class="cart-item-remove" onclick="window.WandeathCart.remove(${index})">
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
                    <span style="font-size:13px; font-weight:600;">${item.name}</span>
                    <span style="font-size:13px; font-weight:800;">R$ ${totalItem.toFixed(2)}</span>
                </div>
            `;
            summaryList.appendChild(sItem);
        }
    });

    if (window.lucide) lucide.createIcons();
    updateTotals(subtotal);
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

    if (!coupon || (coupon.type === 'limited' && coupon.usesLeft <= 0)) {
        msg.innerText = '❌ Cupom inválido ou esgotado!';
        msg.style.color = '#ff4a4a';
        window.currentCoupon = null;
    } else {
        window.currentCoupon = coupon;
        msg.innerText = `✅ Cupom ${coupon.name} aplicado!`;
        msg.style.color = '#22c55e';
    }
    renderCart();
}

function initCheckoutActions() {
    const userStr = localStorage.getItem('wandeath_user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const nameInput = document.getElementById('checkout-name');
            const emailInput = document.getElementById('checkout-email');
            if (nameInput && !nameInput.value && user.name) nameInput.value = user.name;
            if (emailInput && !emailInput.value && user.email) emailInput.value = user.email;
        } catch (e) {}
    }

    const confirmBtn = document.getElementById('confirm-payment-btn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const name = document.getElementById('checkout-name')?.value.trim();
            const email = document.getElementById('checkout-email')?.value.trim();
            if (!name || !email) return alert('Preencha seus dados!');
            if (window.WandeathCart.get().length === 0) return alert('Carrinho vazio!');
            startPaymentProcess(name, email);
        };
    }
}

const MP_TOKEN = 'APP_USR-6939778403757007-042321-66d2bef7d6ee6c3d3c269703ab411f51-256063981';

async function startPaymentProcess(name, email) {
    const total = window.lastTotal;
    const grid = document.getElementById('main-checkout-grid');
    if (!grid) return;

    grid.innerHTML = '<div style="text-align:center; padding:100px;"><h2>Processando...</h2></div>';

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
                description: `Wandeath VIP - Pedido`,
                payment_method_id: 'pix',
                payer: { email, first_name: name }
            })
        });

        const data = await response.json();
        if (!data.id) throw new Error('Falha no pagamento');

        const pix = data.point_of_interaction.transaction_data;
        grid.innerHTML = `
            <div style="text-align:center; padding:40px; background:var(--bg-card); border-radius:20px;">
                <h2>Pague com PIX</h2>
                <img src="data:image/png;base64,${pix.qr_code_base64}" style="width:200px; margin:20px 0;">
                <input type="text" value="${pix.qr_code}" id="pix-raw-code" readonly style="width:100%; background:rgba(0,0,0,0.2); border:1px solid var(--border); color:#fff; padding:10px; margin-bottom:10px;">
                <button onclick="copyPix()" style="background:var(--primary); color:#fff; padding:10px 20px; border-radius:10px; border:none; cursor:pointer;">Copiar Código</button>
            </div>
        `;

        window.copyPix = () => {
            document.getElementById('pix-raw-code').select();
            document.execCommand('copy');
            alert('Copiado!');
        };

        const poll = setInterval(async () => {
            const r = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, { headers: { 'Authorization': `Bearer ${MP_TOKEN}` } });
            const s = await r.json();
            if (s.status === 'approved') {
                clearInterval(poll);

                // Salvar pedido no localStorage
                try {
                    const cart = window.WandeathCart.get();
                    const products = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
                    const currentOrders = JSON.parse(localStorage.getItem('wandeath_orders') || '[]');
                    const date = new Date().toISOString();
                    
                    cart.forEach(item => {
                        const prod = products.find(p => p.name === item.name);
                        const deliveryData = prod ? prod.delivery : "Aguardando entrega do sistema.";
                        
                        let fullDelivery = [];
                        for(let i=0; i<(item.qty || 1); i++) {
                            fullDelivery.push(deliveryData);
                        }
                        
                        currentOrders.push({
                            customerEmail: email,
                            productName: item.name,
                            qty: item.qty || 1,
                            total: (parseFloat(item.price) || 0) * (parseInt(item.qty) || 1),
                            date: date,
                            delivery: fullDelivery.join('\n')
                        });
                    });
                    
                    localStorage.setItem('wandeath_orders', JSON.stringify(currentOrders));
                } catch(e) {
                    console.error("Erro ao salvar pedido:", e);
                }

                window.WandeathCart.clear();
                window.location.href = '/pedidos/';
            }
        }, 5000);

    } catch (err) {
        alert('Erro: ' + err.message);
        location.reload();
    }
}

window.applyCartCoupon = applyCartCoupon;
window.renderCart = renderCart;
