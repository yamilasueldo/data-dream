// JavaScript para el slider
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = slides.length;

function showSlide(index) {
  // Ocultar todas las slides
  slides.forEach(slide => slide.classList.remove('active'));
  indicators.forEach(indicator => indicator.classList.remove('active'));
  
  // Mostrar la slide actual
  slides[index].classList.add('active');
  indicators[index].classList.add('active');
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  showSlide(currentSlide);
}

// Auto-slide cada 4 segundos
setInterval(nextSlide, 4000);

// Navegación manual por indicadores
indicators.forEach((indicator, index) => {
  indicator.addEventListener('click', () => {
    currentSlide = index;
    showSlide(currentSlide);
  });
});

// ========================================
// FUNCIONALIDADES DE AUTENTICACIÓN
// ========================================

// Función para acceso rápido
function accesoRapido() {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  if (emailInput && passwordInput) {
    emailInput.value = 'admin@datadream.com';
    passwordInput.value = 'admin123';
    
    // Auto-enviar después de un momento
    setTimeout(() => {
      const form = document.getElementById('loginForm');
      if (form) {
        form.submit();
      }
    }, 500);
  }
}

// Funciones para mostrar mensajes
function mostrarMensaje(mensaje, tipo = 'info') {
  const messagesDiv = document.getElementById('messages');
  if (!messagesDiv) return;

  const tipoClase = tipo === 'error' ? 'alert-error' : 'alert-success';
  const icono = tipo === 'error' ? '❌' : '✅';
  
  messagesDiv.innerHTML = `
    <div class="${tipoClase}" style="padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      ${icono} ${mensaje}
    </div>
  `;

  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    messagesDiv.innerHTML = '';
  }, 5000);
}

// Mostrar mensajes desde URL params
function mostrarMensajesURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');
  const mensaje = urlParams.get('mensaje');

  if (error) {
    mostrarMensaje(error, 'error');
  }

  if (mensaje) {
    mostrarMensaje(mensaje, 'success');
  }
}

// Manejar el formulario de login
function configurarFormularioLogin() {
  const loginForm = document.getElementById('loginForm');
  const btnLogin = document.getElementById('btnLogin');
  
  if (!loginForm || !btnLogin) return;

  loginForm.addEventListener('submit', function(e) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');

    // Validación básica
    if (!emailInput?.value.trim() || !passwordInput?.value.trim()) {
      e.preventDefault();
      mostrarMensaje('Por favor, completa todos los campos', 'error');
      return;
    }

    // Mostrar loading
    btnLogin.disabled = true;
    if (loginText) loginText.style.display = 'none';
    if (loginSpinner) loginSpinner.style.display = 'inline';

    // El formulario se enviará normalmente al servidor
    // El loading se mantendrá hasta que se recargue la página
  });
}

// Configurar eventos para botones de acceso rápido
function configurarBotones() {
  // Buscar botones de acceso rápido por diferentes posibles IDs/clases
  const botonesAccesoRapido = [
    document.getElementById('btnAccesoRapido'),
    document.querySelector('.btn-guest'),
    document.querySelector('[onclick*="accesoRapido"]')
  ].filter(Boolean);

  botonesAccesoRapido.forEach(boton => {
    boton.addEventListener('click', accesoRapido);
  });
}

function configurarAutoFocus() {
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.focus();
  }
}


document.addEventListener('DOMContentLoaded', function() {
  console.log('🔄 Inicializando login.js...');
  

  mostrarMensajesURL();
  configurarFormularioLogin();
  configurarBotones();
  configurarAutoFocus();
  
  console.log('✅ Login.js inicializado correctamente');
});


window.accesoRapido = accesoRapido;