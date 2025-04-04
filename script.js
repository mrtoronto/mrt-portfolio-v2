document.addEventListener('DOMContentLoaded', () => {
    // Add cursor effect to terminal
    const terminalContent = document.querySelector('.terminal-content');
    const typewriterElements = document.querySelectorAll('.typewriter');
    
    // Add cursor to terminal
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '_';
    terminalContent.appendChild(cursor);
    
    // Make cursor blink
    setInterval(() => {
        cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
    }, 500);

    // Add hover effect to social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'scale(1.1) translateY(-5px)';
        });
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'scale(1) translateY(0)';
        });
    });

    // Add parallax effect to waves
    window.addEventListener('mousemove', (e) => {
        const waves = document.querySelectorAll('.wave');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        waves.forEach((wave, index) => {
            const speed = (index + 1) * 0.5;
            wave.style.transform = `translateX(${mouseX * speed}px) translateY(${mouseY * speed}px)`;
        });
    });
}); 