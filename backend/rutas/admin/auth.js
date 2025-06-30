const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');

// Importar controladores
const ControladorAdminVista = require('../../controladores/ControladorAdminVista');
const ControladorAuth = require('../../controladores/ControladorAuth');

// ==========================================
// CONFIGURACIÓN DE MULTER
// ==========================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/productos/');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'producto-' + uniqueSuffix + extension);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// ==========================================
// VALIDACIONES
// ==========================================

const validarProducto = [
  body('nombre').trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('categoria').isIn(['ropa', 'accesorios']).withMessage('La categoría debe ser "ropa" o "accesorios"'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0'),
  body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0')
];

const validarRegistro = [
  body('nombre').trim().isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('apellido').trim().isLength({ min: 2, max: 50 }).withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  body('email').isEmail().withMessage('Debe ser un email válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];

// ==========================================
// RUTAS DE AUTENTICACIÓN (VISTAS)
// ==========================================

// GET /admin/login
router.get('/login', ControladorAdminVista.mostrarLogin);

// GET /admin/register  
router.get('/register', ControladorAdminVista.mostrarRegistro);

// GET /admin/logout
router.get('/logout', ControladorAuth.logout);

// ==========================================
// RUTAS DE AUTENTICACIÓN (PROCESAMIENTO)
// ==========================================

// POST /admin/auth/login
router.post('/auth/login', ControladorAuth.procesarLogin);

// POST /admin/auth/registro
router.post('/auth/registro', validarRegistro, ControladorAuth.procesarRegistro);

// ==========================================
// RUTAS DE DASHBOARD Y PRODUCTOS
// ==========================================

// GET /admin/dashboard
router.get('/dashboard', ControladorAuth.verificarAuth, ControladorAdminVista.mostrarDashboard);

// GET /admin/productos - Lista de productos
router.get('/productos', ControladorAuth.verificarAuth, ControladorAdminVista.mostrarProductos);

// GET /admin/productos/nuevo
router.get('/productos/nuevo', ControladorAuth.verificarAuth, ControladorAdminVista.mostrarFormularioNuevo);

// GET /admin/productos/editar/:id
router.get('/productos/editar/:id', ControladorAuth.verificarAuth, ControladorAdminVista.mostrarFormularioEditar);

// POST /admin/productos (crear)
router.post('/productos', 
  ControladorAuth.verificarAuth,
  upload.single('imagen'),
  validarProducto,
  ControladorAdminVista.crearProducto
);

// POST /admin/productos/:id (actualizar)
router.post('/productos/:id', 
  ControladorAuth.verificarAuth,
  upload.single('imagen'),
  validarProducto,
  ControladorAdminVista.actualizarProducto
);

// POST /admin/productos/alternar/:id
router.post('/productos/alternar/:id', 
  ControladorAuth.verificarAuth,
  ControladorAdminVista.alternarEstadoProducto
);

// POST /admin/productos/eliminar/:id
router.post('/productos/eliminar/:id', 
  ControladorAuth.verificarAuth,
  ControladorAdminVista.eliminarProducto
);

// ==========================================
// MANEJO DE ERRORES
// ==========================================

router.use((error, req, res, next) => {
  console.error('❌ Error en rutas admin:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.redirect('/admin/dashboard?error=El archivo es demasiado grande');
    }
  }
  
  res.redirect('/admin/dashboard?error=Error interno del servidor');
});

module.exports = router;