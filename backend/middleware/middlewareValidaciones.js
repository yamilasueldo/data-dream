// middleware/validaciones.js
const { body, param, query } = require('express-validator');

// Validaciones para productos
const validarProducto = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),
  
  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
    .trim(),
  
  body('categoria')
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isIn(['ropa', 'accesorios'])
    .withMessage('La categoría debe ser "ropa" o "accesorios"'),
  
  body('precio')
    .notEmpty()
    .withMessage('El precio es requerido')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo')
    .toFloat(),
  
  body('stock')
    .notEmpty()
    .withMessage('El stock es requerido')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero positivo')
    .toInt(),
  
  body('color')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El color no puede exceder 50 caracteres')
    .trim(),
  
  body('talla')
    .optional()
    .isLength({ max: 20 })
    .withMessage('El talle no puede exceder 20 caracteres')
    .trim(),
  
  body('material')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El material no puede exceder 100 caracteres')
    .trim(),
];

// Validaciones para login
const validarLogin = [
  body('email')
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .trim(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
];

// Validaciones para registro
const validarRegistro = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras')
    .trim(),
  
  body('apellido')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras')
    .trim(),
  
  body('email')
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .trim(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6, max: 255 })
    .withMessage('La contraseña debe tener entre 6 y 255 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número')
];

// Validaciones para crear venta
const validarVenta = [
  body('nombreCliente')
    .notEmpty()
    .withMessage('El nombre del cliente es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),
  
  body('emailCliente')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .trim(),
  
  body('productos')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un producto'),
  
  body('productos.*.id')
    .notEmpty()
    .withMessage('El ID del producto es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número válido'),
  
  body('productos.*.cantidad')
    .notEmpty()
    .withMessage('La cantidad es requerida')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número positivo'),
  
  body('total')
    .notEmpty()
    .withMessage('El total es requerido')
    .isFloat({ min: 0 })
    .withMessage('El total debe ser un número positivo')
];

// Validación para ID en parámetros
const validarId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número válido')
    .toInt()
];

// Validaciones para query de productos (API)
const validarQueryProductos = [
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número positivo')
    .toInt(),
  
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser entre 1 y 100')
    .toInt(),
  
  query('categoria')
    .optional()
    .isIn(['ropa', 'accesorios'])
    .withMessage('La categoría debe ser "ropa" o "accesorios"'),
  
  query('activo')
    .optional()
    .isBoolean()
    .withMessage('El parámetro activo debe ser true o false')
    .toBoolean(),
  
  query('buscar')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres')
    .trim()
];

// Sanitización de datos comunes
const sanitizarDatos = [
  body('*').trim(), // Eliminar espacios en blanco
  body('*').escape() // Escapar caracteres HTML peligrosos
];

module.exports = {
  validarProducto,
  validarLogin,
  validarRegistro,
  validarVenta,
  validarId,
  validarQueryProductos,
  sanitizarDatos
};