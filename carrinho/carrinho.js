document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
    renderCart();
    initCartCheckout();
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
        list.innerHTML = '<div style="text-align:center; padding:100px 20px;"><div style="font-size:40px; margin-bottom:20px;">🛒</div><h3 style="margin-bottom:10px;">Seu carrinho está vazio</h3><p style="color:var(--text-sec); margin-bottom:25px;">Parece que você ainda não adicionou nada.</p><a href="../index.html#produtos" style="background:var(--primary); color:#fff; padding:12px 30px; border-radius:10px; text-decoration:none; font-weight:800;">Ver Produtos</a></div>';
        if (summaryList) summaryList.innerHTML = '<div style="font-size:12px; color:var(--text-sec);">Nenhum item</div>';
        updateTotals(0);
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

        // Render in main list
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <img src="${prod.image || '../image.png'}" alt="${prod.name}">
            <div class="info">
                <h5>${prod.name}</h5>
                <div class="cart-item-qty" style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                    <button onclick="updateCartQty(${index}, -1)" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: #fff; width: 24px; height: 24px; border-radius: 4px; cursor: pointer;">-</button>
                    <span style="font-size: 13px; font-weight: 700;">${item.qty}</span>
                    <button onclick="updateCartQty(${index}, 1)" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: #fff; width: 24px; height: 24px; border-radius: 4px; cursor: pointer;">+</button>
                </div>
            </div>
            <div class="price">
                R$ ${totalItem.toFixed(2)}
                <button class="cart-item-remove" onclick="removeCartItem(${index})" style="background: none; border: none; color: #ff4a4a; cursor: pointer; margin-left: 15px; vertical-align: middle;">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
            </div>
        `;
        list.appendChild(row);

        // Render in sidebar summary (Now according to the new request)
        if (summaryList) {
            const sItem = document.createElement('div');
            sItem.className = 'summary-product-item';
            sItem.style.marginBottom = '20px';
            sItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <span style="font-weight: 700; font-size: 14px; flex: 1; padding-right: 15px;">🛜 ${prod.name}</span>
                    <span style="font-weight: 700; font-size: 14px; color: var(--text-main);">R$ ${parseFloat(prod.price).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; color: var(--text-sec); font-size: 13px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 4px 12px; border-radius: 4px; border: 1px solid var(--border);">
                        ${item.qty}
                    </div>
                    <span style="font-weight: 600;">R$ ${totalItem.toFixed(2)}</span>
                </div>
            `;
            summaryList.appendChild(sItem);
        }
    });

    if (window.lucide) lucide.createIcons();
    updateTotals(subtotal);
}

function updateCartQty(index, delta) {
    const cart = getCart();
    cart[index].qty += delta;
    if (cart[index].qty < 1) cart[index].qty = 1;
    localStorage.setItem('wandeath_cart', JSON.stringify(cart));
    renderCart();
}

function removeCartItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    localStorage.setItem('wandeath_cart', JSON.stringify(cart));
    renderCart();
}

function updateTotals(subtotal) {
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-final-total');
    const totalBtnEl = document.getElementById('cart-final-total-btn');
    const discountLine = document.getElementById('cart-discount-line');
    const discountEl = document.getElementById('cart-discount-val');

    let total = subtotal;
    let discountVal = 0;

    if (window.currentCoupon) {
        discountVal = (subtotal * window.currentCoupon.discount) / 100;
        total = subtotal - discountVal;
        
        if (discountLine) {
            discountLine.style.display = 'flex';
            discountEl.innerText = `R$ ${discountVal.toFixed(2)}`;
        }
    } else {
        if (discountLine) discountLine.style.display = 'none';
    }

    if (subtotalEl) subtotalEl.innerText = `R$ ${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.innerText = `R$ ${total.toFixed(2)}`;
    if (totalBtnEl) totalBtnEl.innerText = `R$ ${total.toFixed(2)}`;
    
    window.lastSubtotal = subtotal;
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
        msg.innerText = 'Cupom inválido!';
        msg.style.color = '#ff4a4a';
        window.currentCoupon = null;
        renderCart();
        return;
    }

    if (coupon.type === 'limited' && coupon.usesLeft <= 0) {
        msg.innerText = 'Cupom esgotado!';
        msg.style.color = '#ff4a4a';
        window.currentCoupon = null;
        renderCart();
        return;
    }

    window.currentCoupon = coupon;
    msg.innerText = `Cupom ${coupon.name} aplicado! (${coupon.discount}% off)`;
    msg.style.color = '#22c55e';
    renderCart();
}

function initCartCheckout() {
    const confirmBtn = document.getElementById('confirm-payment-btn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const name = document.getElementById('checkout-name').value;
            const email = document.getElementById('checkout-email').value;
            if (!name || !email) return alert('Por favor, preencha seu nome e email.');
            
            finalizeCartPurchase();
        };
    }
}

const MP_TOKEN = 'APP_USR-6939778403757007-042321-66d2bef7d6ee6c3d3c269703ab411f51-256063981';

async function finalizeCartPurchase() {
    const name = document.getElementById('checkout-name').value;
    const email = document.getElementById('checkout-email').value;
    const total = window.lastTotal;
    const cart = getCart();
    
    const checkoutArea = document.querySelector('.checkout-grid');
    const originalContent = checkoutArea.innerHTML;

    checkoutArea.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 100px 0;">
            <div class="loader" style="width: 50px; height: 50px; border: 5px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <h3>Gerando seu PIX...</h3>
            <p style="color: var(--text-sec);">Aguarde enquanto conectamos ao Mercado Pago.</p>
        </div>
        <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
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
                description: `Wandeath VIP - Compra de ${cart.length} itens`,
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
        if (!data.id) throw new Error(data.message || 'Erro ao gerar pagamento');

        const pix = data.point_of_interaction.transaction_data;
        const payId = data.id;

        checkoutArea.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px;">
                <h2 style="margin-bottom: 10px;">Pague com PIX</h2>
                <p style="color: var(--text-sec); margin-bottom: 30px;">Aprovação imediata e entrega automática.</p>
                
                <div style="background: #fff; padding: 20px; border-radius: 16px; display: inline-block; margin-bottom: 30px;">
                    <img src="data:image/png;base64,${pix.qr_code_base64}" style="width: 220px; height: 220px;">
                </div>

                <div style="max-width: 500px; margin: 0 auto 30px;">
                    <label style="display: block; font-size: 11px; font-weight: 800; color: var(--text-sec); text-transform: uppercase; margin-bottom: 10px;">Código PIX Copia e Cola</label>
                    <div style="display: flex; gap: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 5px; border-radius: 10px;">
                        <input type="text" value="${pix.qr_code}" id="pix-code" readonly style="flex: 1; background: transparent; border: none; color: #fff; padding: 12px; font-size: 13px; outline: none;">
                        <button onclick="copyPixCode()" style="background: var(--primary); color: #fff; border: none; padding: 0 25px; border-radius: 8px; font-weight: 800; cursor: pointer;">Copiar</button>
                    </div>
                </div>

                <div id="payment-status" style="display: flex; align-items: center; justify-content: center; gap: 12px; color: var(--text-sec); font-size: 14px;">
                    <div class="loader" style="width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <span>Aguardando confirmação do pagamento...</span>
                </div>
            </div>
            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        `;

        window.copyPixCode = () => {
            const el = document.getElementById('pix-code');
            el.select();
            document.execCommand('copy');
            alert('Código PIX copiado!');
        };

        const poll = setInterval(async () => {
            const r = await fetch(`https://api.mercadopago.com/v1/payments/${payId}`, {
                headers: { 'Authorization': `Bearer ${MP_TOKEN}` }
            });
            const s = await r.json();
            if (s.status === 'approved') {
                clearInterval(poll);
                completeCartOrder();
            }
        }, 5000);

    } catch (err) {
        alert('Erro: ' + err.message);
        checkoutArea.innerHTML = originalContent;
        renderCart();
    }
}

function completeCartOrder() {
    const cart = getCart();
    const products = getProducts();
    const orders = JSON.parse(localStorage.getItem('wandeath_orders') || '[]');
    
    // Apply coupon use
    if (window.currentCoupon && window.currentCoupon.type === 'limited') {
        const coupons = JSON.parse(localStorage.getItem('wandeath_coupons') || '[]');
        const cIndex = coupons.findIndex(c => c.name === window.currentCoupon.name);
        if (cIndex !== -1) {
            coupons[cIndex].usesLeft--;
            coupons[cIndex].usedCount++;
            localStorage.setItem('wandeath_coupons', JSON.stringify(coupons));
        }
    }

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

window.updateCartQty = updateCartQty;
window.removeCartItem = removeCartItem;
window.applyCartCoupon = applyCartCoupon;
