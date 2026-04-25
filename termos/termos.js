document.addEventListener('DOMContentLoaded', () => {
    // Mouse Glow effect
    const glow = document.getElementById('mouse-glow');
    window.addEventListener('mousemove', (e) => {
        if (glow) {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        }
    });

    if (window.lucide) lucide.createIcons();
});
