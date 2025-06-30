// ========================================
// FUNCIONALIDADES DE REGISTRO
// ========================================

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

// Validar fortaleza de contraseña
function calcularFortalezaPassword(password) {
  let strength = 0;
  
  if (password.length >= 6) strength += 1;
  if (password.length >= 8) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  return Math.min(strength, 4);
}

// Actualizar indicador de fortaleza
function actualizarIndicadorFortaleza(strength) {
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');
  
  if (!strengthBar || !strengthText) return;

  const colors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745'];
  const texts = ['Muy débil', 'Débil', 'Buena', 'Fuerte'];
  const widths = ['25%', '50%', '75%', '100%'];
  
  if (strength > 0) {
    strengthBar.style.backgroundColor = colors[strength - 1];
    strengthBar.style.width = widths[strength - 1];
    strengthText.textContent = texts[strength - 1];
    strengthText.style.color = colors[strength - 1];
  }
}

// Configurar validación de contraseña
function configurarValidacionPassword() {
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const passwordStrength = document.getElementById('passwordStrength');
  
  if (!passwordInput) return;

  // Validación de fortaleza
  passwordInput.addEventListener('input', function() {
    const password = this.value;
    const strength = calcularFortalezaPassword(password);
    
    if (password.length > 0 && passwordStrength) {
      passwordStrength.style.display = 'block';
      actualizarIndicadorFortaleza(strength);
    } else if (passwordStrength) {
      passwordStrength.style.display = 'none';
    }
  });

  // Validación de coincidencia
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('blur', function() {
      validarCoincidenciaPassword();
    });

    confirmPasswordInput.addEventListener('input', function() {
      // Limpiar error mientras escribe
      if (this.value === passwordInput.value) {
        this.style.borderColor = '';
        const errorMsg = document.getElementById('passwordMismatch');
        if (errorMsg) {
          errorMsg.remove();
        }
      }
    });
  }
}

// Validar coincidencia de contraseñas
function validarCoincidenciaPassword() {
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  
  if (!passwordInput || !confirmPasswordInput) return true;

  if (confirmPasswordInput.value && confirmPasswordInput.value !== passwordInput.value) {
    confirmPasswordInput.style.borderColor = '#dc3545';
    
    // Agregar mensaje de error si no existe
    if (!document.getElementById('passwordMismatch')) {
      const errorMsg = document.createElement('small');
      errorMsg.id = 'passwordMismatch';
      errorMsg.style.color = '#dc3545';
      errorMsg.style.fontSize = '0.8rem';
      errorMsg.style.marginTop = '0.5rem';
      errorMsg.style.display = 'block';
      errorMsg.textContent = 'Las contraseñas no coinciden';
      confirmPasswordInput.parentNode.appendChild(errorMsg);
    }
    return false;
  } else {
    confirmPasswordInput.style.borderColor = '';
    const errorMsg = document.getElementById('passwordMismatch');
    if (errorMsg) {
      errorMsg.remove();
    }
    return true;
  }
}

// Validar formulario completo
function validarFormulario(formData) {
  const data = Object.fromEntries(formData);
  
  // Validar nombre y apellido
  if (!data.nombre?.trim() || !data.apellido?.trim()) {
    mostrarMensaje('Nombre y apellido son requeridos', 'error');
    return false;
  }

  // Validar que solo contengan letras
  const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!regexNombre.test(data.nombre) || !regexNombre.test(data.apellido)) {
    mostrarMensaje('Nombre y apellido solo pueden contener letras', 'error');
    return false;
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    mostrarMensaje('Por favor, ingresa un email válido', 'error');
    return false;
  }

  // Validar contraseña
  if (data.password.length < 6) {
    mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
    return false;
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    mostrarMensaje('La contraseña debe contener al menos una minúscula, una mayúscula y un número', 'error');
    return false;
  }

  // Validar coincidencia de contraseñas
  if (data.password !== data.confirmPassword) {
    mostrarMensaje('Las contraseñas no coinciden', 'error');
    return false;
  }

  return true;
}

// Configurar formulario de registro
function configurarFormularioRegistro() {
  const registerForm = document.getElementById('registerForm');
  const btnRegister = document.getElementById('btnRegister');
  
  if (!registerForm || !btnRegister) return;

  registerForm.addEventListener('submit', function(e) {
    const formData = new FormData(this);
    const registerText = document.getElementById('registerText');
    const registerSpinner = document.getElementById('registerSpinner');

    // Validar formulario
    if (!validarFormulario(formData)) {
      e.preventDefault();
      return;
    }

    // Validar coincidencia de contraseñas una vez más
    if (!validarCoincidenciaPassword()) {
      e.preventDefault();
      return;
    }

    // Mostrar loading
    btnRegister.disabled = true;
    if (registerText) registerText.style.display = 'none';
    if (registerSpinner) registerSpinner.style.display = 'inline';

    // El formulario se enviará normalmente al servidor
  });
}

// Auto-focus en el primer campo
function configurarAutoFocus() {
  const nombreInput = document.getElementById('nombre');
  if (nombreInput) {
    nombreInput.focus();
  }
}

// Configurar validaciones en tiempo real
function configurarValidacionTiempoReal() {
  // Validar nombres solo con letras
  const nombreInputs = [
    document.getElementById('nombre'),
    document.getElementById('apellido')
  ].filter(Boolean);

  nombreInputs.forEach(input => {
    input.addEventListener('input', function() {
      const valor = this.value;
      const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
      
      if (!regexNombre.test(valor)) {
        this.value = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      }
    });
  });

  // Validar email en tiempo real
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('blur', function() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (this.value && !emailRegex.test(this.value)) {
        this.style.borderColor = '#dc3545';
      } else {
        this.style.borderColor = '';
      }
    });
  }
}

// Agregar indicador de fortaleza si no existe
function agregarIndicadorFortaleza() {
  const passwordInput = document.getElementById('password');
  if (!passwordInput) return;

  const existingIndicator = document.getElementById('passwordStrength');
  if (existingIndicator) return;

  // Crear indicador de fortaleza
  const strengthContainer = document.createElement('div');
  strengthContainer.id = 'passwordStrength';
  strengthContainer.style.cssText = 'margin-top: 0.5rem; display: none;';
  
  const strengthBar = document.createElement('div');
  strengthBar.style.cssText = 'background: #dee2e6; height: 4px; border-radius: 2px; overflow: hidden; margin-bottom: 0.5rem;';
  
  const strengthFill = document.createElement('div');
  strengthFill.id = 'strengthBar';
  strengthFill.style.cssText = 'height: 100%; transition: all 0.3s ease; width: 0%;';
  
  const strengthText = document.createElement('small');
  strengthText.id = 'strengthText';
  strengthText.style.cssText = 'color: #6c757d; font-size: 0.8rem;';
  
  strengthBar.appendChild(strengthFill);
  strengthContainer.appendChild(strengthBar);
  strengthContainer.appendChild(strengthText);
  
  // Insertar después del input de contraseña
  passwordInput.parentNode.appendChild(strengthContainer);
}

// Inicialización cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔄 Inicializando register.js...');
  
  // Configurar todas las funcionalidades
  mostrarMensajesURL();
  agregarIndicadorFortaleza();
  configurarValidacionPassword();
  configurarFormularioRegistro();
  configurarAutoFocus();
  configurarValidacionTiempoReal();
  
  console.log('✅ Register.js inicializado correctamente');
});