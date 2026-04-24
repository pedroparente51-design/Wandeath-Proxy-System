/* 
   CALIXTO VIP - ELITE ENGINE
   Neural network particles + Mouse glow + Scroll effects
*/

document.addEventListener('DOMContentLoaded', () => {
    initMouseGlow();
    initScrollReveal();
    initScrollProgress();
    initNeuralNetwork();
    initFAQ();
    loadProductDetails();
});

function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productName = params.get('name');
    const allProducts = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
    
    const product = allProducts.find(p => p.name === productName);
    
    if (product) {
        document.getElementById('prod-title').textContent = "🛜 " + product.name;
        document.getElementById('prod-price').textContent = "R$ " + parseFloat(product.price).toFixed(2);
        document.getElementById('prod-img').src = product.image;
        
        // Stock logic
        const stockLines = product.delivery ? product.delivery.trim().split('\n') : [];
        const stockCount = stockLines.length;
        document.getElementById('prod-stock').textContent = stockCount + " EM ESTOQUE";
        
        // Description
        const descEl = document.getElementById('prod-desc-text');
        if (descEl) descEl.textContent = product.description;
    } else {
        document.getElementById('prod-title').textContent = "Produto não encontrado";
    }
}

function buyNow() {
    const params = new URLSearchParams(window.location.search);
    const productName = params.get('name');
    const allProducts = JSON.parse(localStorage.getItem('wandeath_products') || '[]');
    const product = allProducts.find(p => p.name === productName);
    
    if (product) {
        const cart = JSON.parse(localStorage.getItem('wandeath_cart') || '[]');
        const existing = cart.find(item => item.name === product.name);
        
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        
        localStorage.setItem('wandeath_cart', JSON.stringify(cart));
        window.location.href = '../carrinho/carrinho.html';
    }
}

window.buyNow = buyNow;
window.addToCart = function() {
    buyNow(); // Por enquanto simplificado
};

/* ─── Mouse Follow Glow ─────────────────────────── */
function initMouseGlow() {
    const glow = document.getElementById('mouse-glow');
    if (!glow) return;

    let mouseX = 0, mouseY = 0;
    let ballX = 0, ballY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        ballX += (mouseX - ballX) * 0.08;
        ballY += (mouseY - ballY) * 0.08;
        glow.style.left = ballX + 'px';
        glow.style.top  = ballY + 'px';
        requestAnimationFrame(animate);
    }
    animate();
}

/* ─── Scroll Reveal ─────────────────────────────── */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('rx-reveal--visible');
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.rx-reveal').forEach(el => observer.observe(el));
}

/* ─── Scroll Progress Bar ───────────────────────── */
function initScrollProgress() {
    const bar = document.getElementById('scroll-bar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const h = document.documentElement;
        const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
        bar.style.width = pct + '%';
    });
}

/* ─── Neural Network Canvas ─────────────────────── */
function initNeuralNetwork() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles = [];
    let mouse = { x: -9999, y: -9999 };
    const COUNT       = 90;
    const MAX_DIST    = 160;
    const MOUSE_DIST  = 200;

    /* Colors from CSS vars (match #ee0000) */
    const COL_DOT     = 'rgba(238, 0, 0, 0.55)';
    const COL_LINE    = 'rgba(238, 0, 0, {o})';
    const COL_MOUSE   = 'rgba(238, 0, 0, {o})';

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', () => { resize(); spawnParticles(); });
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    class Particle {
        constructor() { this.reset(true); }

        reset(rand = false) {
            this.x  = rand ? Math.random() * W : (Math.random() < 0.5 ? 0 : W);
            this.y  = rand ? Math.random() * H : Math.random() * H;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.r  = Math.random() * 1.8 + 0.4;
            this.alpha = Math.random() * 0.5 + 0.3;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            /* Subtle mouse attraction */
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const d  = Math.sqrt(dx * dx + dy * dy);
            if (d < MOUSE_DIST) {
                this.x += dx * 0.004;
                this.y += dy * 0.004;
            }

            /* Bounce off edges */
            if (this.x < 0 || this.x > W) this.vx *= -1;
            if (this.y < 0 || this.y > H) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = COL_DOT;
            ctx.fill();
        }
    }

    function spawnParticles() {
        particles = [];
        for (let i = 0; i < COUNT; i++) particles.push(new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            const a = particles[i];

            /* Particle → Particle lines */
            for (let j = i + 1; j < particles.length; j++) {
                const b  = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const d  = Math.sqrt(dx * dx + dy * dy);

                if (d < MAX_DIST) {
                    const opacity = (1 - d / MAX_DIST) * 0.18;
                    ctx.strokeStyle = COL_LINE.replace('{o}', opacity);
                    ctx.lineWidth   = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }

            /* Particle → Mouse lines */
            const mdx = a.x - mouse.x;
            const mdy = a.y - mouse.y;
            const md  = Math.sqrt(mdx * mdx + mdy * mdy);

            if (md < MOUSE_DIST) {
                const opacity = (1 - md / MOUSE_DIST) * 0.55;
                ctx.strokeStyle = COL_MOUSE.replace('{o}', opacity);
                ctx.lineWidth   = 1;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        requestAnimationFrame(loop);
    }

    resize();
    spawnParticles();
    loop();
}

/* ─── FAQ Accordion ─────────────────────────────── */
function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            const content = item.querySelector('.faq-content');
            const isOpen  = content.style.display === 'block';

            /* Close all */
            document.querySelectorAll('.faq-content').forEach(c => c.style.display = 'none');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

            /* Toggle clicked */
            if (!isOpen) {
                content.style.display = 'block';
                item.classList.add('open');
            }
        });
    });
}
