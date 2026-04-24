/* 
   Wandeath VIP - Login Engine
   Extracted from inline HTML for better performance and organization.
*/

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
    initMouseGlow();
    initNeuralNetwork();

    // Form Submissions
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Social Buttons
    const googleBtn = document.querySelector('.btn-google');
    const discordBtn = document.querySelector('.btn-discord');

    if (googleBtn) {
        googleBtn.addEventListener('click', e => {
            e.preventDefault();
            simulateOAuth('Google', 'google_user@gmail.com', 'Usuário Google');
        });
    }
    if (discordBtn) {
        discordBtn.addEventListener('click', e => {
            e.preventDefault();
            simulateOAuth('Discord', 'discord_user#1234', 'Usuário Discord');
        });
    }
});

function toggleAuth(e) {
    e.preventDefault();
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const footerText = document.getElementById('auth-footer-text');
    const divider = document.getElementById('auth-divider');

    if (loginForm.style.display !== 'none') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        title.innerText = 'Crie sua conta';
        subtitle.innerText = 'Comece sua jornada elite no Wandeath VIP.';
        divider.innerText = 'OU CADASTRE COM E-MAIL';
        footerText.innerHTML = 'Já tem uma conta? <a href="#" onclick="toggleAuth(event)">Entre aqui</a>';
    } else {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        title.innerText = 'Acesse sua conta';
        subtitle.innerText = 'Seja bem-vindo de volta ao ecossistema VIP.';
        divider.innerText = 'OU COM E-MAIL';
        footerText.innerHTML = 'Não tem uma conta? <a href="#" onclick="toggleAuth(event)">Crie agora</a>';
    }
}
window.toggleAuth = toggleAuth;

function handleRegister(e) {
    e.preventDefault();
    const inputs = this.querySelectorAll('input');
    const name = inputs[0].value;
    const email = inputs[1].value;
    const password = inputs[2].value;

    const user = { name, email, password };
    localStorage.setItem('wandeath_user', JSON.stringify(user));

    alert('Conta criada com sucesso! Redirecionando...');
    localStorage.setItem('wandeath_logged_in', 'true');
    window.location.href = '../index.html';
}

function handleLogin(e) {
    e.preventDefault();
    const inputs = this.querySelectorAll('input');
    const email = inputs[0].value;
    const password = inputs[1].value;

    const storedData = localStorage.getItem('wandeath_user');
    if (storedData) {
        const user = JSON.parse(storedData);
        if (user.email === email && user.password === password) {
            localStorage.setItem('wandeath_logged_in', 'true');
            alert('Login realizado com sucesso! Bem-vindo de volta, ' + user.name);
            window.location.href = '../index.html';
            return;
        }
    }

    if (email === 'admin@admin.com' && password === 'admin') {
        localStorage.setItem('wandeath_logged_in', 'true');
        alert('Login de Administrador realizado!');
        window.location.href = '../index.html';
    } else {
        alert('E-mail ou senha incorretos! (Tente criar uma conta primeiro ou use admin@admin.com / admin)');
    }
}

function simulateOAuth(provider, mockEmail, mockName) {
    const width = 500;
    const height = 600;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);

    const popup = window.open('', '_blank', `width=${width},height=${height},top=${top},left=${left}`);

    let color = provider === 'Google' ? '#fff' : '#5865F2';
    let bg = provider === 'Google' ? '#111' : '#36393f';

    popup.document.write(`
        <html style="font-family: 'Plus Jakarta Sans', sans-serif; text-align: center; padding: 50px; background: ${bg}; color: #fff;">
            <h2 style="margin-top: 40px;">Conectando com ${provider}...</h2>
            <p style="color: #aaa;">Aguardando autorização segura.</p>
            <div style="margin: 50px auto; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.2); border-top-color: ${color}; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        </html>
    `);

    setTimeout(() => {
        popup.close();
        const user = { name: mockName, email: mockEmail, provider: provider };
        localStorage.setItem('wandeath_user', JSON.stringify(user));
        localStorage.setItem('wandeath_logged_in', 'true');
        alert('Autenticado via ' + provider + ' com sucesso!');
        window.location.href = '../index.html';
    }, 2500);
}

/* ─── Neural Network & Mouse Effects ─── */
function initMouseGlow() {
    const glow = document.getElementById('mouse-glow');
    if (!glow) return;
    let mouseX = 0, mouseY = 0;
    let ballX = 0, ballY = 0;
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    function animate() {
        ballX += (mouseX - ballX) * 0.08;
        ballY += (mouseY - ballY) * 0.08;
        glow.style.left = ballX + 'px';
        glow.style.top  = ballY + 'px';
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
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    class Particle {
        constructor() { this.reset(); }
        reset() { this.x = Math.random() * W; this.y = Math.random() * H; this.vx = (Math.random()-0.5)*0.5; this.vy = (Math.random()-0.5)*0.5; this.r = Math.random()*2; }
        update() { this.x += this.vx; this.y += this.vy; if(this.x<0||this.x>W)this.vx*=-1; if(this.y<0||this.y>H)this.vy*=-1; }
        draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fillStyle = 'rgba(238,0,0,0.4)'; ctx.fill(); }
    }
    function spawn() { for(let i=0;i<COUNT;i++) particles.push(new Particle()); }
    function loop() { ctx.clearRect(0,0,W,H); particles.forEach(p=>{p.update();p.draw();}); requestAnimationFrame(loop); }
    resize(); spawn(); loop();
}
