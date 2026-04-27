/**
 * Wandeath VIP - Central Cart Engine
 * Este arquivo centraliza toda a lógica de compra para evitar conflitos.
 */

window.WandeathCart = {
    // Chave do localStorage
    KEY: 'wandeath_cart',
    PRODUCTS_KEY: 'wandeath_products',

    // Recupera o carrinho com segurança
    get() {
        try {
            const data = localStorage.getItem(this.KEY);
            const cart = data ? JSON.parse(data) : [];
            return Array.isArray(cart) ? cart : [];
        } catch (e) {
            console.error('[Cart] Erro ao ler carrinho:', e);
            return [];
        }
    },

    // Salva o carrinho
    save(cart) {
        localStorage.setItem(this.KEY, JSON.stringify(cart));
        this.updateBadge();
        // Disparar evento para outras abas
        window.dispatchEvent(new Event('storage'));
    },

    // Adiciona um produto
    add(name, qty = 1, btn = null) {
        if (!name) return;
        
        const products = JSON.parse(localStorage.getItem(this.PRODUCTS_KEY) || '[]');
        const prod = products.find(p => p.name === name);
        
        if (!prod) {
            console.error('[Cart] Produto não encontrado:', name);
            return;
        }

        let cart = this.get();
        const existingIndex = cart.findIndex(item => item.name === name);
        
        let currentQty = existingIndex > -1 ? cart[existingIndex].qty : 0;
        let newQty = currentQty + qty;
        
        const minQty = parseInt(prod.minqty || prod.minQty || prod.min_qty) || 1;
        const maxQty = parseInt(prod.maxqty || prod.maxQty || prod.max_qty) || 100;
        
        console.log(`[Wandeath] Adicionando: ${name}. Estoque Local: ${prod.delivery?.split('\n').length || 0}. Limites: Min=${minQty}, Max=${maxQty}. Nova Quantidade desejada: ${newQty}`);

        if (newQty > maxQty) {
            alert(`O limite máximo para este produto é ${maxQty} unidade(s).`);
            return;
        }
        
        if (newQty < minQty) {
            newQty = minQty;
        }

        if (existingIndex > -1) {
            cart[existingIndex].qty = newQty;
        } else {
            cart.push({
                name: prod.name,
                price: parseFloat(prod.price) || 0,
                image: prod.image || '/logo.png',
                qty: newQty,
                category: prod.category || ''
            });
        }

        this.save(cart);

        // Feedback Visual
        if (btn) {
            const original = btn.innerHTML;
            btn.innerHTML = '✅ Adicionado!';
            btn.style.pointerEvents = 'none';
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.pointerEvents = 'all';
            }, 2000);
        } else {
            alert('Produto adicionado ao carrinho!');
        }
    },

    // Remove um produto
    remove(index) {
        let cart = this.get();
        cart.splice(index, 1);
        this.save(cart);
        if (typeof renderCart === 'function') renderCart();
    },

    // Atualiza quantidade
    updateQty(index, delta) {
        let cart = this.get();
        if (!cart[index]) return;
        
        const products = JSON.parse(localStorage.getItem(this.PRODUCTS_KEY) || '[]');
        const prod = products.find(p => p.name === cart[index].name);
        const minQty = prod ? (parseInt(prod.minqty || prod.minQty || prod.min_qty) || 1) : 1;
        const maxQty = prod ? (parseInt(prod.maxqty || prod.maxQty || prod.max_qty) || 100) : 100;
        
        let newQty = cart[index].qty + delta;
        
        if (newQty > maxQty) {
            alert(`O limite máximo para este produto é ${maxQty} unidade(s).`);
            return;
        }
        
        if (newQty < minQty) {
            if (delta < 0 && cart[index].qty <= minQty) return;
            newQty = minQty;
        }
        
        cart[index].qty = newQty;
        
        this.save(cart);
        if (typeof renderCart === 'function') renderCart();
    },

    // Atualiza o contador (Badge) em todas as páginas
    updateBadge() {
        const cart = this.get();
        const count = cart.reduce((total, item) => total + (parseInt(item.qty) || 0), 0);
        const badges = document.querySelectorAll('#cart-count');
        
        badges.forEach(badge => {
            if (badge) {
                badge.innerText = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        });
    },

    // Limpa o carrinho
    clear() {
        localStorage.removeItem(this.KEY);
        this.updateBadge();
    }
};

// Atalhos globais para compatibilidade com o HTML antigo
window.addToCart = (name, btn) => window.WandeathCart.add(name, 1, btn);
window.updateCartBadge = () => window.WandeathCart.updateBadge();

// Inicialização automática
document.addEventListener('DOMContentLoaded', () => {
    window.WandeathCart.updateBadge();
});
