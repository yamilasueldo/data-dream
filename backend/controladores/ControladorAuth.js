const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

class ControladorAuth {
  
  // ==========================================
  // PROCESAMIENTO DE LOGIN
  // ==========================================
  
  static procesarLogin(req, res) {
    try {
      const { email, password } = req.body;
      
      console.log('🔍 Intento de login:', { email, password: '***' });
      
      // Validación simple para desarrollo
      if (email === usuarioTemp.email && password === usuarioTemp.password) {
        console.log('✅ Login exitoso');
        
        // Generar token JWT
        const token = jwt.sign(
          { 
            id: usuarioTemp.id, 
            email: usuarioTemp.email,
            rol: usuarioTemp.rol 
          },
          process.env.JWT_SECRET || 'clave_super_secreta_pero_enserio',
          { expiresIn: '24h' }
        );
        
        // Configurar cookie
        res.cookie('admin-token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });
        
        res.redirect('/admin/dashboard');
      } else {
        console.log('❌ Credenciales incorrectas');
        res.redirect('/admin/login?error=Credenciales incorrectas');
      }
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      res.redirect('/admin/login?error=Error interno del servidor');
    }
  }
  
  // PROCESAMIENTO DE REGISTRO
 
  
  static procesarRegistro(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('admin/register', {
          error: null,
          success: null,
          errors: errors.array(),
          formData: req.body
        });
      }
      
      const { nombre, apellido, email, password } = req.body;
      
      // Verificar si el usuario ya existe 
      if (email === usuarioTemp.email) {
        return res.render('admin/register', {
          error: 'Ya existe un usuario con este email',
          success: null,
          errors: [],
          formData: req.body
        });
      }
      
      // Simular creación exitosa
      console.log('✅ Usuario registrado:', { nombre, apellido, email });
      
      res.redirect('/admin/login?success=Usuario registrado correctamente. Puedes iniciar sesión.');
      
    } catch (error) {
      console.error('❌ Error en registro:', error);
      res.render('admin/register', {
        error: 'Error interno del servidor',
        success: null,
        errors: [],
        formData: req.body
      });
    }
  }
  
 
  // LOGOUT
  
  
  static logout(req, res) {
    try {
      console.log('🚪 Usuario cerrando sesión');
      
      // Limpiar cookie
      res.clearCookie('admin-token');
      
      res.redirect('/admin/login?success=Sesión cerrada correctamente');
      
    } catch (error) {
      console.error('❌ Error en logout:', error);
      res.redirect('/admin/login?error=Error al cerrar sesión');
    }
  }
  
  // MIDDLEWARE DE VERIFICACIÓN
 
  
  static verificarAuth(req, res, next) {
    try {
      const token = req.cookies['admin-token'] || req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        console.log('❌ Token no encontrado');
        return res.redirect('/admin/login?error=Debes iniciar sesión');
      }
      
      // Verificar token JWT
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_super_secreta_pero_enserio');
        
        // Simular usuario encontrado
        if (decoded.email === usuarioTemp.email) {
          req.usuario = {
            id: usuarioTemp.id,
            nombre: usuarioTemp.nombre,
            apellido: usuarioTemp.apellido,
            email: usuarioTemp.email,
            rol: usuarioTemp.rol
          };
          
          console.log('✅ Usuario autenticado:', req.usuario.email);
          next();
        } else {
          console.log('❌ Usuario no encontrado en base de datos');
          res.clearCookie('admin-token');
          res.redirect('/admin/login?error=Token inválido');
        }
        
      } catch (jwtError) {
        console.log('❌ Token inválido:', jwtError.message);
        res.clearCookie('admin-token');
        res.redirect('/admin/login?error=Sesión expirada. Inicia sesión nuevamente');
      }
      
    } catch (error) {
      console.error('❌ Error en verificación de auth:', error);
      res.redirect('/admin/login?error=Error interno del servidor');
    }
  }
  
  
  // VERIFICAR ADMIN (MIDDLEWARE)
 
  
  static verificarAdmin(req, res, next) {
    if (!req.usuario) {
      return res.redirect('/admin/login?error=Debes iniciar sesión');
    }
    
    if (req.usuario.rol !== 'admin' && req.usuario.rol !== 'super_admin') {
      return res.status(403).render('admin/error', {
        error: { 
          status: 403, 
          message: 'Acceso denegado. Se requieren permisos de administrador' 
        },
        usuario: req.usuario
      });
    }
    
    next();
  }
  

  // VERIFICAR TOKEN (API)  
  static verificarToken(req, res) {
    try {
      const token = req.cookies['admin-token'] || req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          exito: false,
          mensaje: 'Token no proporcionado'
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_super_secreta_pero_enserio');
      
      if (decoded.email === usuarioTemp.email) {
        res.json({
          exito: true,
          datos: {
            usuario: {
              id: usuarioTemp.id,
              nombre: usuarioTemp.nombre,
              apellido: usuarioTemp.apellido,
              email: usuarioTemp.email,
              rol: usuarioTemp.rol
            }
          }
        });
      } else {
        res.status(401).json({
          exito: false,
          mensaje: 'Token inválido'
        });
      }
      
    } catch (error) {
      console.error('❌ Error al verificar token:', error);
      res.status(401).json({
        exito: false,
        mensaje: 'Token inválido'
      });
    }
  }
  

  // VERIFICAR SESIÓN ADMIN (MIDDLEWARE API)
  
  static verificarSesionAdmin(req, res, next) {
    try {
      const token = req.cookies['admin-token'] || req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          exito: false,
          mensaje: 'Token no proporcionado'
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_super_secreta_pero_enserio');
      
      if (decoded.email === usuarioTemp.email) {
        req.usuario = {
          id: usuarioTemp.id,
          nombre: usuarioTemp.nombre,
          apellido: usuarioTemp.apellido,
          email: usuarioTemp.email,
          rol: usuarioTemp.rol
        };
        next();
      } else {
        res.status(401).json({
          exito: false,
          mensaje: 'Token inválido'
        });
      }
      
    } catch (error) {
      console.error('❌ Error en verificación de sesión:', error);
      res.status(401).json({
        exito: false,
        mensaje: 'Token inválido'
      });
    }
  }
}

module.exports = ControladorAuth;