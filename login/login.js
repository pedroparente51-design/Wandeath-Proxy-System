/* 
   Wandeath VIP - Login Engine
   Refactored for maximum stability and VPS compatibility.
*/

const safeRun = (name, fn) => {
    try { 
        if (typeof fn === 'function') {
            fn(); 
        } else {
            console.warn(`[Wandeath Login] safeRun: ${name} não é uma função.`);
        }
    } catch (e) { 
        console.error(`[Wandeath Login] Erro em ${name}:`, e); 
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Wandeath Login] Inicializando engine de autenticação...');
    
    if (window.lucide) {
        try { lucide.createIcons(); } catch(e) { console.error('Lucide Error:', e); }
    }

    safeRun('initMouseGlow', initMouseGlow);
    safeRun('initNeuralNetwork', initNeuralNetwork);
    safeRun('updateCartBadge', updateCartBadge);

    // Form Submissions
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('[Wandeath Login] Formulário de login pronto.');
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('[Wandeath Login] Formulário de registro pronto.');
    }

    // Social Buttons
    const googleBtn = document.querySelector('.btn-google');
    const discordBtn = document.querySelector('.btn-discord');

    if (googleBtn) {
        googleBtn.addEventListener('click', async e => {
            e.preventDefault();
            console.log('[Wandeath Login] Botão Google clicado.');
            
            if (!window.supabaseClient) {
                alert('Erro: Supabase não inicializado. Verifique sua conexão ou configuração.');
                return;
            }
            
            const redirectUrl = `${window.location.origin}/`;
            
            console.log('[Wandeath Login] Iniciando fluxo Google Auth...');
            console.log('[Wandeath Login] URL de Redirecionamento:', redirectUrl);

            try {
                const { error } = await window.supabaseClient.auth.signInWithOAuth({
                    provider: 'google',
                    options: { 
                        redirectTo: redirectUrl,
                        skipBrowserRedirect: false
                    }
                });
                if (error) throw error;
            } catch (err) {
                console.error('[Wandeath Login] Erro OAuth:', err.message);
                alert('Falha ao conectar com o Google: ' + err.message);
            }
        });
    }

    if (discordBtn) {
        discordBtn.addEventListener('click', async e => {
            e.preventDefault();
            console.log('[Wandeath Login] Botão Discord clicado.');
            
            if (!window.supabaseClient) {
                alert('Erro: Supabase não inicializado.');
                return;
            }

            const redirectUrl = `${window.location.origin}/`;

            try {
                const { error } = await window.supabaseClient.auth.signInWithOAuth({
                    provider: 'discord',
                    options: { 
                        redirectTo: redirectUrl,
                        skipBrowserRedirect: false
                    }
                });
                if (error) throw error;
            } catch (err) {
                console.error('[Wandeath Login] Erro OAuth:', err.message);
                alert('Falha ao conectar com o Discord: ' + err.message);
            }
        });
    }
});

function toggleAuth(e) {
    if (e) e.preventDefault();
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const footerText = document.getElementById('auth-footer-text');
    const divider = document.getElementById('auth-divider');

    if (!loginForm || !registerForm) return;

    if (loginForm.style.display !== 'none') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        if (title) title.innerText = 'Crie sua conta';
        if (subtitle) subtitle.innerText = 'Comece sua jornada elite no Wandeath VIP.';
        if (divider) divider.innerText = 'OU CADASTRE COM E-MAIL';
        if (footerText) footerText.innerHTML = 'Já tem uma conta? <a href="#" onclick="toggleAuth(event)">Entre aqui</a>';
    } else {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        if (title) title.innerText = 'Acesse sua conta';
        if (subtitle) subtitle.innerText = 'Seja bem-vindo de volta ao ecossistema VIP.';
        if (divider) divider.innerText = 'OU COM E-MAIL';
        if (footerText) footerText.innerHTML = 'Não tem uma conta? <a href="#" onclick="toggleAuth(event)">Crie agora</a>';
    }
}
window.toggleAuth = toggleAuth;

async function handleRegister(e) {
    e.preventDefault();
    console.log('[Wandeath Login] Processando registro no Supabase...');
    const inputs = this.querySelectorAll('input');
    const name = inputs[0].value.trim();
    const email = inputs[1].value.trim();
    const password = inputs[2].value.trim();

    if (!name || !email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    if (password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    if (!window.supabaseClient) {
        alert('Erro: Supabase não inicializado. Recarregue a página.');
        return;
    }

    try {
        const { data, error } = await window.supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name
                },
                emailRedirectTo: window.location.origin + '/'
            }
        });

        if (error) throw error;

        console.log('[Wandeath Login] Registro concluído para:', email, data);

        // Se o Supabase retornou sessão, o auto-confirm está ativo
        if (data.session) {
            localStorage.setItem('wandeath_logged_in', 'true');
            localStorage.setItem('wandeath_user', JSON.stringify({
                name: name,
                email: email
            }));
            alert('Conta criada com sucesso! Bem-vindo ao Wandeath VIP.');
            window.location.href = '../index.html';
        } else {
            // Auto-confirm desativado — precisa confirmar e-mail
            alert('Conta criada! Verifique seu e-mail (' + email + ') para confirmar sua conta. Depois, faça login.');
            toggleAuth();
        }
    } catch (err) {
        console.error('[Wandeath Login] Erro no registro:', err.message);
        alert('Falha ao criar conta: ' + err.message);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    console.log('[Wandeath Login] Processando login no Supabase...');
    const inputs = this.querySelectorAll('input');
    const email = inputs[0].value.trim();
    const password = inputs[1].value.trim();

    if (!window.supabaseClient) {
        alert('Erro: Supabase não inicializado.');
        return;
    }

    try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        console.log('[Wandeath Login] Login realizado com sucesso:', email);
        
        // Sincronizar com localStorage para compatibilidade
        localStorage.setItem('wandeath_logged_in', 'true');
        localStorage.setItem('wandeath_user', JSON.stringify({
            name: data.user.user_metadata.full_name || email.split('@')[0],
            email: data.user.email
        }));

        alert(`Bem-vindo de volta!`);
        window.location.href = '../index.html';
    } catch (err) {
        console.error('[Wandeath Login] Erro no login:', err.message);
        
        // Fallback para admin fixo se necessário (opcional)
        if (email === 'admin@admin.com' && password === 'admin') {
            localStorage.setItem('wandeath_logged_in', 'true');
            alert('Login de Administrador (Bypass) realizado!');
            window.location.href = '../index.html';
            return;
        }

        alert('E-mail ou senha incorretos! ' + err.message);
    }
}

function simulateOAuth(provider, mockEmail, mockName) {
    const width = 500, height = 600;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);

    const popup = window.open('', '_blank', `width=${width},height=${height},top=${top},left=${left}`);
    if (!popup) {
        alert('Por favor, habilite popups para realizar o login social.');
        return;
    }

    let color = provider === 'Google' ? '#fff' : '#5865F2';
    let bg = provider === 'Google' ? '#111' : '#36393f';

    popup.document.write(`
        <html style="font-family: sans-serif; text-align: center; padding: 50px; background: ${bg}; color: #fff;">
            <h2 style="margin-top: 40px;">Autenticando via ${provider}...</h2>
            <div style="margin: 50px auto; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top-color: ${color}; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
            <p style="opacity: 0.6;">Redirecionando de volta em instantes...</p>
        </html>
    `);

    setTimeout(() => {
        popup.close();
        const user = { name: mockName, email: mockEmail, provider: provider };
        localStorage.setItem('wandeath_user', JSON.stringify(user));
        localStorage.setItem('wandeath_logged_in', 'true');
        window.location.href = '../index.html';
    }, 2000);
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('wandeath_cart') || '[]');
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.innerText = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

/* ─── Efeitos Visuais ─── */
function initMouseGlow() {
    const glow = document.getElementById('mouse-glow');
    if (!glow) return;
    let mouseX = 0, mouseY = 0, ballX = 0, ballY = 0;
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    function animate() {
        ballX += (mouseX - ballX) * 0.1;
        ballY += (mouseY - ballY) * 0.1;
        glow.style.transform = `translate(${ballX}px, ${ballY}px)`;
        requestAnimationFrame(animate);
    }
    animate();
}

function initNeuralNetwork() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const COUNT = 60;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    
    class Particle {
        constructor() { this.reset(); }
        reset() { this.x = Math.random() * W; this.y = Math.random() * H; this.vx = (Math.random()-0.5)*0.5; this.vy = (Math.random()-0.5)*0.5; this.r = Math.random()*2; }
        update() { this.x += this.vx; this.y += this.vy; if(this.x<0||this.x>W)this.vx*=-1; if(this.y<0||this.y>H)this.vy*=-1; }
        draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fillStyle = 'rgba(238,0,0,0.3)'; ctx.fill(); }
    }
    
    const spawn = () => { resize(); for(let i=0;i<COUNT;i++) particles.push(new Particle()); };
    const loop = () => { ctx.clearRect(0,0,W,H); particles.forEach(p=>{p.update();p.draw();}); requestAnimationFrame(loop); };
    spawn(); loop();
}
