const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../../modelos');
const { validarLogin, validarRegistro } = require('../../middleware/middlewareValidaciones');

// POST /api/auth/login - Iniciar sesión
router.post('/login', validarLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Datos de entrada inválidos',
        errores: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ 
      where: { 
        email: email.toLowerCase(),
        activo: true 
      } 
    });

    if (!usuario) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Credenciales incorrectas'
      });
    }

    // Verificar contraseña
    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Credenciales incorrectas'
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        rol: usuario.rol,
        nombre: usuario.nombre,
        apellido: usuario.apellido
      },
      process.env.JWT_SECRET || 'clave_super_secreta_pero_enserio',
      { expiresIn: '24h' }
    );

    res.json({
      exito: true,
      mensaje: 'Login exitoso',
      datos: {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          rol: usuario.rol
        }
      },
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/auth/registro - Registrar nuevo administrador
router.post('/registro', validarRegistro, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Datos de entrada inválidos',
        errores: errors.array()
      });
    }

    const { nombre, apellido, email, password, rol = 'admin' } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (usuarioExistente) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Ya existe un usuario con este email'
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      email: email.toLowerCase(),
      password,
      rol,
      activo: true
    });

    res.status(201).json({
      exito: true,
      mensaje: 'Usuario creado exitosamente',
      datos: {
        usuario: {
          id: nuevoUsuario.id,
          nombre: nuevoUsuario.nombre,
          apellido: nuevoUsuario.apellido,
          email: nuevoUsuario.email,
          rol: nuevoUsuario.rol
        }
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        exito: false,
        mensaje: 'Error de validación',
        errores: error.errors.map(err => ({
          campo: err.path,
          mensaje: err.message
        }))
      });
    }

    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/auth/verificar - Verificar token
router.get('/verificar', async (req, res) => {
  try {
    const token = req.cookies['admin-token'] || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_super_secreta_pero_enserio');
    
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token inválido'
      });
    }

    res.json({
      exito: true,
      datos: {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          rol: usuario.rol
        }
      }
    });

  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(401).json({
      exito: false,
      mensaje: 'Token inválido'
    });
  }
});

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', (req, res) => {
  try {
    res.json({
      exito: true,
      mensaje: 'Logout exitoso'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor'
    });
  }
});

module.exports = router;