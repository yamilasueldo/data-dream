const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// TODO: Importar controlador cuando esté creado
// const ControladorVenta = require('../controladores/controladorVenta');

// Middleware de validación para crear venta
const validarVenta = [
  body('nombreCliente')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre del cliente debe tener entre 2 y 100 caracteres'),
  
  body('productos')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un producto'),
  
  body('productos.*.id')
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número entero válido'),
  
  body('productos.*.cantidad')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero mayor a 0'),
  
  body('productos.*.precio')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número mayor o igual a 0')
];

// ==========================================
// RUTAS API DE VENTAS (JSON)
// ==========================================

// POST /api/ventas - Crear nueva venta
router.post('/', validarVenta, async (req, res) => {
  try {
    console.log('💰 Creando nueva venta...');
    console.log('📊 Datos recibidos:', req.body);
    
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Datos de entrada inválidos',
        errores: errores.array()
      });
    }

    const { nombreCliente, productos, total } = req.body;
    
    // Calcular total si no viene
    let totalCalculado = total;
    if (!totalCalculado) {
      totalCalculado = productos.reduce((sum, prod) => sum + (prod.precio * prod.cantidad), 0);
    }
    
    // Generar número de venta único
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const numeroVenta = `VTA-${timestamp}-${random}`;
    
    // TODO: Aquí se creará la venta en la base de datos cuando esté implementado
    // const nuevaVenta = await ControladorVenta.crearVenta(req, res);
    
    // Por ahora, respuesta simulada para que funcione el frontend
    const ventaSimulada = {
      id: Math.floor(Math.random() * 1000) + 1,
      numeroVenta,
      nombreCliente,
      total: totalCalculado,
      fechaVenta: new Date().toISOString(),
      estado: 'completada',
      productos: productos.map(prod => ({
        id: prod.id,
        nombre: prod.nombre || `Producto ${prod.id}`,
        categoria: prod.categoria || 'ropa',
        cantidad: prod.cantidad,
        precio: prod.precio || 0,
        subtotal: prod.precio * prod.cantidad
      }))
    };

    console.log('✅ Venta creada (simulada):', numeroVenta);

    res.status(201).json({
      exito: true,
      mensaje: 'Venta creada exitosamente',
      datos: ventaSimulada
    });

  } catch (error) {
    console.error('❌ Error al crear venta:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/ventas - Obtener todas las ventas (con paginación)
router.get('/', async (req, res) => {
  try {
    console.log('📋 Obteniendo ventas...');
    
    const { 
      pagina = 1, 
      limite = 10, 
      fechaInicio, 
      fechaFin, 
      estado 
    } = req.query;

    // TODO: Implementar con base de datos real
    // const ventasResult = await ControladorVenta.obtenerVentas(req, res);
    
    // Por ahora, datos simulados
    const ventasSimuladas = [
      {
        id: 1,
        numeroVenta: 'VTA-1735646400000-123',
        nombreCliente: 'Cliente Demo',
        total: 45000,
        fechaVenta: new Date().toISOString(),
        estado: 'completada',
        items: [
          {
            producto: { nombre: 'Remera Básica', categoria: 'ropa' },
            cantidad: 2,
            precio: 15000,
            subtotal: 30000
          },
          {
            producto: { nombre: 'Gorra Snapback', categoria: 'accesorios' },
            cantidad: 1,
            precio: 15000,
            subtotal: 15000
          }
        ]
      }
    ];

    const totalVentas = ventasSimuladas.length;
    const totalPaginas = Math.ceil(totalVentas / limite);

    res.json({
      exito: true,
      datos: {
        ventas: ventasSimuladas,
        paginacion: {
          paginaActual: parseInt(pagina),
          totalPaginas,
          totalRegistros: totalVentas,
          tieneAnterior: pagina > 1,
          tieneSiguiente: pagina < totalPaginas
        }
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener ventas:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/ventas/:id - Obtener una venta específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Obteniendo venta ID: ${id}`);

    // TODO: Buscar en base de datos real
    // const venta = await ControladorVenta.obtenerVenta(req, res);
    
    // Venta simulada
    const ventaSimulada = {
      id: parseInt(id),
      numeroVenta: `VTA-${Date.now()}-${id}`,
      nombreCliente: 'Cliente Demo',
      total: 30000,
      fechaVenta: new Date().toISOString(),
      estado: 'completada',
      items: [
        {
          id: 1,
          cantidad: 2,
          precio: 15000,
          subtotal: 30000,
          producto: {
            id: 1,
            nombre: 'Remera Básica',
            categoria: 'ropa',
            imagen: '/img/img1.png'
          }
        }
      ]
    };

    if (!ventaSimulada) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Venta no encontrada'
      });
    }

    res.json({
      exito: true,
      datos: ventaSimulada
    });

  } catch (error) {
    console.error('❌ Error al obtener venta:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/ventas/numero/:numeroVenta - Obtener venta por número de ticket
router.get('/numero/:numeroVenta', async (req, res) => {
  try {
    const { numeroVenta } = req.params;
    console.log(`🎫 Obteniendo venta por número: ${numeroVenta}`);

    // TODO: Buscar por número de venta en BD
    // const venta = await ControladorVenta.obtenerVentaPorNumero(req, res);
    
    // Por ahora, respuesta simulada
    const ventaSimulada = {
      id: 1,
      numeroVenta,
      nombreCliente: 'Cliente Demo',
      total: 30000,
      fechaVenta: new Date().toISOString(),
      estado: 'completada'
    };

    res.json({
      exito: true,
      datos: ventaSimulada
    });

  } catch (error) {
    console.error('❌ Error al obtener venta por número:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PATCH /api/ventas/:id/estado - Actualizar estado de una venta
router.patch('/:id/estado', [
  body('estado')
    .isIn(['pendiente', 'procesando', 'completada', 'cancelada'])
    .withMessage('El estado debe ser: pendiente, procesando, completada o cancelada')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Estado inválido',
        errores: errores.array()
      });
    }

    console.log(`🔄 Actualizando estado de venta ${id} a: ${estado}`);

    // TODO: Actualizar en base de datos
    // const venta = await ControladorVenta.actualizarEstadoVenta(req, res);
    
    res.json({
      exito: true,
      mensaje: `Estado de venta actualizado a: ${estado}`,
      datos: {
        id: parseInt(id),
        estado,
        fechaActualizacion: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/ventas/:id - Cancelar una venta
router.delete('/:id', [
  body('motivo')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('El motivo no puede exceder 300 caracteres')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    
    console.log(`❌ Cancelando venta ${id}. Motivo: ${motivo || 'No especificado'}`);

    // TODO: Cancelar venta en base de datos
    // const resultado = await ControladorVenta.cancelarVenta(req, res);
    
    res.json({
      exito: true,
      mensaje: 'Venta cancelada exitosamente',
      datos: {
        id: parseInt(id),
        estado: 'cancelada',
        motivo: motivo || null,
        fechaCancelacion: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error al cancelar venta:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;