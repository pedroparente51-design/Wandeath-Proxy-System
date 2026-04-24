document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
    renderCart();
    initCheckoutActions();
    
    // Mouse Glow effect
    document.addEventListener('mousemove', (e) => {
        const glow = document.getElementById('mouse-glow');
        if (glow) {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        }
    });
});

window.currentCoupon = null;

function getCart() {
    return JSON.parse(localStorage.getItem('wandeath_cart') || '[]');
}

function getProducts() {
    return JSON.parse(localStorage.getItem('wandeath_products') || '[]');
}

function renderCart() {
    const list = document.getElementById('cart-items-list');
    const summaryList = document.getElementById('cart-summary-items');
    const cart = getCart();
    const products = getProducts();

    if (!list) return;

    if (cart.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding:80px 20px;">
                <i data-lucide="shopping-cart" style="width:60px; height:60px; color:var(--text-sec); margin-bottom:20px; opacity:0.3;"></i>
                <h3 style="margin-bottom:10px;">Seu carrinho está vazio</h3>
                <p style="color:var(--text-sec); margin-bottom:30px;">Explore nossos produtos e adicione proxies de alta qualidade.</p>
                <a href="../index.html#produtos" style="background:var(--primary); color:#fff; padding:12px 30px; border-radius:10px; text-decoration:none; font-weight:800; transition:0.3s;" class="btn-shine">Ir para a Loja</a>
            </div>
        `;
        if (summaryList) summaryList.innerHTML = '<div style="font-size:12px; color:var(--text-sec); text-align:center;">Vazio</div>';
        updateTotals(0);
        if (window.lucide) lucide.createIcons();
        return;
    }

    list.innerHTML = '';
    if (summaryList) summaryList.innerHTML = '';

    let subtotal = 0;

    cart.forEach((item, index) => {
        const prod = products.find(p => p.name === item.name);
        if (!prod) return;

        const totalItem = parseFloat(prod.price) * item.qty;
        subtotal += totalItem;

        // Render main list item
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <img src="${prod.image || '../image.png'}" alt="${prod.name}">
            <div class="info">
                <h5>${prod.name}</h5>
                <div class="cart-item-qty">
                    <button onclick="updateQty(${index}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="updateQty(${index}, 1)">+</button>
                </div>
            </div>
            <div class="price">
                <div style="margin-bottom:10px;">R$ ${totalItem.toFixed(2)}</div>
                <button class="cart-item-remove" onclick="removeItem(${index})" title="Remover">
                    <i data-lucide="trash-2" style="width:18px;"></i>
                </button>
            </div>
        `;
        list.appendChild(row);

        // Render summary item
        if (summaryList) {
            const sItem = document.createElement('div');
            sItem.className = 'summary-product-item';
            sItem.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span style="font-size:13px; font-weight:600;">${prod.name}</span>
                    <span style="font-size:13px; font-weight:700;">R$ ${totalItem.toFixed(2)}</span>
                </div>
                <div style="font-size:11px; color:var(--text-sec);">${item.qty}x R$ ${parseFloat(prod.price).toFixed(2)}</div>
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
            const name = document.getElementById('checkout-name').value;
            const email = document.getElementById('checkout-email').value;
            
            if (!name || !email) {
                return alert('Por favor, preencha todos os dados de contato.');
            }

            const cart = getCart();
            if (cart.length === 0) return alert('Seu carrinho está vazio.');
            
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

    window.location.href = '../pedidos/pedidos.html';
}

window.updateQty = updateQty;
window.removeItem = removeItem;
window.applyCartCoupon = applyCartCoupon;
