/* ─── Checker Logic & Effects ─── */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // --- Tab Switching Logic ---
    window.switchTab = function(type) {
        const tabs = document.querySelectorAll('.tab-btn');
        const contents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => content.style.display = 'none');

        if (type === 'user') {
            tabs[0].classList.add('active');
            document.getElementById('content-user').style.display = 'block';
        } else {
            tabs[1].classList.add('active');
            document.getElementById('content-raw').style.display = 'block';
        }
    };

    // --- Particles & BG Magic ---
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.fillStyle = `rgba(238, 0, 0, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < 50; i++) particles.push(new Particle());

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }
        animate();
    }

    // --- Mouse Interaction (Glow & Parallax) ---
    document.addEventListener('mousemove', (e) => {
        const glow = document.getElementById('mouse-glow');
        if (glow) {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        }

        const x = (window.innerWidth / 2 - e.pageX) / 40;
        const y = (window.innerHeight / 2 - e.pageY) / 40;
        const bg = document.getElementById('parallax-bg');
        if (bg) {
            bg.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
        }
    });

    // --- Rayobyte Integration Logic ---
    const RAYOBYTE_TOKEN = '71706a25-5cdb-44be-89e1-cce5a5604797';
    const API_BASE = 'http://api.scraping.rayobyte.com'; 

    const checkBtn = document.getElementById('btn-check-proxy');
    const resultContainer = document.getElementById('check-result');
    const statusBadge = document.getElementById('status-val');
    const latencyVal = document.getElementById('latency-val');
    const balanceVal = document.getElementById('balance-val');
    const proxyInput = document.getElementById('proxy-input');

    // Auto-load balance on startup
    async function updateBalance() {
        try {
            const res = await fetch(`${API_BASE}/balance?token=${RAYOBYTE_TOKEN}`);
            const data = await res.json();
            if (data && data.balance !== undefined) {
                balanceVal.innerText = data.balance;
                return data.balance;
            }
        } catch (e) {
            console.error('Erro ao carregar saldo:', e);
            balanceVal.innerText = 'Erro';
        }
        return 0;
    }

    updateBalance();

    if (checkBtn) {
        checkBtn.addEventListener('click', async () => {
            // UI State: Verificando
            checkBtn.disabled = true;
            checkBtn.innerHTML = '<span class="loader-mini"></span> Verificando...';
            resultContainer.style.display = 'block';
            statusBadge.innerText = 'Validando...';
            statusBadge.className = 'status-badge';
            latencyVal.innerText = '---';

            // Extract proxy data (for UX, though we focus on Token validation)
            const proxyData = proxyInput ? proxyInput.value.trim() : '';

            try {
                // Step 1: Confirm credits
                const currentBalance = await updateBalance();
                if (currentBalance <= 0) {
                    statusBadge.innerText = 'Sem Créditos';
                    statusBadge.classList.add('warning');
                    return;
                }

                // Step 2: Connection Test + Latency Timer
                const startTime = performance.now();
                
                const targetUrl = 'https://www.google.com';
                const res = await fetch(`${API_BASE}/?token=${RAYOBYTE_TOKEN}&url=${encodeURIComponent(targetUrl)}`);
                
                const endTime = performance.now();
                const latency = Math.round(endTime - startTime);
                
                if (res.status === 200) {
                    statusBadge.innerText = 'Online';
                    statusBadge.className = 'status-badge online';
                    latencyVal.innerText = `${latency}ms`;
                    // Neon effect handled by CSS .online class
                } else {
                    throw new Error('Offline');
                }

            } catch (error) {
                statusBadge.innerText = 'Offline';
                statusBadge.className = 'status-badge offline';
                latencyVal.innerText = '---';
            } finally {
                checkBtn.disabled = false;
                checkBtn.innerText = 'Verificar Proxy';
            }
        });
    }
});
