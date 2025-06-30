// Middleware para verificar autenticación
const verificarAuth = (req, res, next) => {
  try {
    // Obtener token de cookies
    const token = req.cookies['admin-token'];

    console.log('🔍 Verificando auth, token:', token ? 'presente' : 'ausente');

    if (!token) {
      console.log('❌ No hay token, redirigiendo a login');
      return res.redirect('/admin/login?error=Acceso denegado');
    }

    // Por ahora, middleware simple para desarrollo
    // En producción aquí validarías el JWT
    if (token === 'desarrollo-token') {
      // Usuario temporal para desarrollo
      req.usuario = {
        id: 1,
        nombre: 'Admin',
        apellido: 'Sistema',
        email: 'admin@datadream.com',
        rol: 'admin'
      };

      console.log('✅ Usuario autenticado:', req.usuario.nombre);
      next();
    } else {
      console.log('❌ Token inválido, redirigiendo a login');
      res.clearCookie('admin-token');
      return res.redirect('/admin/login?error=Token inválido');
    }

  } catch (error) {
    console.error('❌ Error en verificarAuth:', error);
    res.clearCookie('admin-token');
    return res.redirect('/admin/login?error=Error de autenticación');
  }
};

// Middleware para verificar rol de administrador
const verificarAdmin = (req, res, next) => {
  try {
    console.log('🔍 Verificando rol admin para usuario:', req.usuario?.nombre);

    if (!req.usuario) {
      console.log('❌ No hay usuario en req, redirigiendo a login');
      return res.redirect('/admin/login?error=Usuario no autenticado');
    }

    if (req.usuario.rol === 'admin' || req.usuario.rol === 'super_admin') {
      console.log('✅ Usuario es admin:', req.usuario.rol);
      next();
    } else {
      console.log('❌ Usuario no es admin:', req.usuario.rol);
      return res.status(403).render('admin/error', {
        error: {
          status: 403,
          message: 'Acceso denegado. Se requieren permisos de administrador.'
        },
        usuario: req.usuario
      });
    }

  } catch (error) {
    console.error('❌ Error en verificarAdmin:', error);
    return res.redirect('/admin/login?error=Error de autorización');
  }
};

// Middleware opcional de autenticación (no falla si no hay token)
const verificarAuthOpcional = async (req, res, next) => {
  try {
    const token = req.cookies['admin-token'];

    if (token && token === 'desarrollo-token') {
      req.usuario = {
        id: 1,
        nombre: 'Admin',
        apellido: 'Sistema',
        email: 'admin@datadream.com',
        rol: 'admin'
      };
    }

    next(); // Continúa sin importar si hay usuario o no

  } catch (error) {
    // En caso de error, continúa sin usuario autenticado
    next();
  }
};

module.exports = {
  verificarAuth: verificarAuth,  // ✅ Usar el nombre correcto
  verificarToken: verificarAuth, // ✅ Mantener compatibilidad si lo usas en otro lado
  verificarSesionAdmin: verificarAuth, // ✅ Alias
  verificarAdmin,
  verificarAuthOpcional
};