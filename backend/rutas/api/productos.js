const express = require('express');
const ControladorProducto = require('../../controladores/ControladorProducto');

const router = express.Router();

// Rutas públicas (sin autenticación)
// GET /api/productos - Obtener productos con filtros y paginación
router.get('/', ControladorProducto.obtenerProductos);

// GET /api/productos/:id - Obtener un producto específico
router.get('/:id', ControladorProducto.obtenerProducto);

// Rutas protegidas (requieren autenticación de admin - por ahora sin middleware)
// POST /api/productos - Crear nuevo producto
router.post('/', ControladorProducto.crearProducto);

// PUT /api/productos/:id - Actualizar producto completo
router.put('/:id', ControladorProducto.actualizarProducto);

// PATCH /api/productos/:id/alternar - Activar/Desactivar producto
router.patch('/:id/alternar', ControladorProducto.alternarProducto);

// DELETE /api/productos/:id - Eliminar producto (baja lógica)
router.delete('/:id', ControladorProducto.eliminarProducto);

module.exports = router;