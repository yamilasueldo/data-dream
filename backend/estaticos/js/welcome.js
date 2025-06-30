// Funciones para la página de bienvenida

function handleClienteClick() {
    // Aquí puedes agregar la lógica para el cliente
    alert('Funcionalidad de cliente en desarrollo');
    // O redirigir a otra página cuando esté lista:
    // window.location.href = '/cliente/index.html';
}

// Efectos adicionales y mejoras de la experiencia de usuario
document.addEventListener('DOMContentLoaded', function() {
    
    // Animación de entrada para las tarjetas
    const userCards = document.querySelectorAll('.user-card');
    userCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });

    // Efecto de hover mejorado para las tarjetas
    userCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });

        // Efecto de click/tap
        card.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-5px) scale(0.98)';
        });

        card.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
    });

    // Efecto de partículas o animación de fondo (opcional)
    createBackgroundEffect();
});

// Función para crear un efecto de fondo sutil
function createBackgroundEffect() {
    const welcomeMain = document.querySelector('.welcome-main');
    
    // Crear elementos decorativos flotantes
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 6 + 4}px;
            height: ${Math.random() * 6 + 4}px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 3 + 2}s ease-in-out infinite alternate;
            pointer-events: none;
        `;
        welcomeMain.appendChild(particle);
    }
}


window.addEventListener('resize', function() {

});

function navigateTo(path) {
    window.location.href = path;
}


window.addEventListener('error', function(e) {
    console.log('Error en welcome.js:', e.error);
  
});