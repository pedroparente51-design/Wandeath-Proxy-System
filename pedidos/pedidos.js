document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
    
    // Esperar o checkLoginState (do home.js) carregar os dados do usuário
    // antes de tentar renderizar os pedidos
    const tryRender = (attempts = 0) => {
        const userDataStr = localStorage.getItem('wandeath_user');
        if (userDataStr || attempts >= 10) {
            renderOrders();
        } else {
            setTimeout(() => tryRender(attempts + 1), 300);
        }
    };
    
    // Dar tempo pro home.js carregar
    setTimeout(() => tryRender(), 500);
});

function renderOrders() {
    const container = document.getElementById('orders-container');
    
    // 1. Get current logged-in user
    const userDataStr = localStorage.getItem('wandeath_user');
    if (!userDataStr) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Acesso Restrito</h3>
                <p>Por favor, realize login para visualizar seus pedidos.</p>
                <a href="/login/" class="btn-primary">Fazer Login</a>
            </div>
        `;
        return;
    }
    const currentUser = JSON.parse(userDataStr);

    // 2. Load and Filter
    const allOrders = JSON.parse(localStorage.getItem('wandeath_orders') || '[]');
    window.userFilteredOrders = allOrders.filter(order => order.customerEmail === currentUser.email);

    if (window.userFilteredOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum pedido encontrado</h3>
                <p>Você ainda não realizou nenhuma compra em nossa plataforma com o e-mail <strong>${currentUser.email}</strong>.</p>
                <a href="/#produtos" class="btn-primary">Ver Produtos</a>
            </div>
        `;
        return;
    }

    container.innerHTML = window.userFilteredOrders.slice().reverse().map((order, index) => {
        const date = new Date(order.date);
        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        return `
            <div class="order-card" style="animation-delay: ${index * 0.1}s">
                <div class="order-card-header">
                    <div class="order-info">
                        <div class="order-date">${dateStr}</div>
                        <h3>${order.productName}</h3>
                    </div>
                    <div class="order-status">
                        <i data-lucide="check-circle"></i> Entregue
                    </div>
                </div>
                <div class="order-details">
                    <div class="order-qty">${order.qty || 1} unidade${(order.qty || 1) > 1 ? 's' : ''}</div>
                    <div style="display:flex; align-items:center; gap:20px;">
                        <div class="order-total">R$ ${parseFloat(order.total || 0).toFixed(2)}</div>
                        <button class="btn-view" onclick="viewOrder(${window.userFilteredOrders.length - 1 - index})">
                            <i data-lucide="eye"></i> Ver produto
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

window.viewOrder = function (idx) {
    const order = window.userFilteredOrders ? window.userFilteredOrders[idx] : null;
    if (!order) return;

    const modal = document.getElementById('details-modal');
    const deliveryBox = document.getElementById('delivery-box');
    const title = document.getElementById('modal-title');
    const copyBtn = document.getElementById('btn-copy-all');

    title.innerText = order.productName;
    const items = order.delivery ? order.delivery.trim().split('\n').filter(Boolean) : [];

    deliveryBox.innerHTML = items.map((line, i) => `
        <div class="delivery-item">
            <span class="delivery-num">${i + 1}</span>
            <span class="delivery-text">${line}</span>
            <button class="btn-copy-mini" onclick="copyText('${line.replace(/'/g, "\\'")}', this)">Copiar</button>
        </div>
    `).join('');

    copyBtn.onclick = () => {
        copyText(items.join('\n'), copyBtn, "Copiar Tudo", "✓ Copiado!");
    };

    modal.classList.add('show');
    if (window.lucide) lucide.createIcons();
}

window.copyText = function (text, btn, originalLabel = "Copiar", successLabel = "✓") {
    navigator.clipboard.writeText(text).then(() => {
        const old = btn.innerHTML;
        btn.innerText = successLabel;
        btn.style.color = "#00ff66";
        setTimeout(() => {
            btn.innerHTML = old;
            btn.style.color = "";
        }, 2000);
    });
}

window.closeModal = function () {
    document.getElementById('details-modal').classList.remove('show');
}

window.onclick = function (event) {
    const modal = document.getElementById('details-modal');
    if (event.target == modal) closeModal();
}
