const { Producto } = require('../modelos');
const { Op } = require('sequelize');

class ControladorProducto {
  
  // GET /api/productos - Obtener productos con filtros y paginación
  static async obtenerProductos(req, res) {
    try {
      const { 
        pagina = 1, 
        limite = 12, 
        categoria, 
        activo,  // ✅ SIN valor por defecto para mostrar todos
        busqueda,
        ordenarPor = 'id',
        orden = 'DESC'
      } = req.query;

      console.log('🔍 Parámetros recibidos:', { pagina, limite, categoria, activo, busqueda });

      const offset = (pagina - 1) * limite;
      const condicionesWhere = {};

      // Filtrar por categoría si se especifica
      if (categoria && categoria !== 'todos') {
        condicionesWhere.categoria = categoria;
        console.log('📂 Filtrando por categoría:', categoria);
      }

      // Filtrar por estado activo SOLO si se especifica
      if (activo !== undefined && activo !== '') {
        condicionesWhere.activo = activo === 'true';
        console.log('🔄 Filtrando por estado:', activo === 'true' ? 'activo' : 'inactivo');
      }

      // Búsqueda por nombre
      if (busqueda && busqueda.trim() !== '') {
        condicionesWhere.nombre = {
          [Op.like]: `%${busqueda.trim()}%`
        };
        console.log('🔍 Filtrando por búsqueda:', busqueda);
      }

      console.log(' Condiciones WHERE:', condicionesWhere);

      const { count, rows: productos } = await Producto.findAndCountAll({
        where: condicionesWhere,
        limit: parseInt(limite),
        offset: parseInt(offset),
        order: [[ordenarPor, orden.toUpperCase()]],
        attributes: {
          exclude: ['createdAt', 'updatedAt'] // Excluir fechas en respuesta
        }
      });

      const totalPaginas = Math.ceil(count / limite);

      console.log(`📊 Encontrados ${count} productos, página ${pagina}/${totalPaginas}`);

      const productosConImagen = productos.map(p => {
        const imagen = p.imagen && !p.imagen.includes('/uploads/')
          ? `${req.protocol}://${req.get('host')}/uploads/productos/${p.imagen}`
          : p.imagen || '/img/default-product.png';
      
        return {
          ...p.toJSON(),
          imagen
        };
      });
      
      res.json({
        exito: true,
        datos: {
          productos: productosConImagen,
          paginacion: {
            paginaActual: parseInt(pagina),
            totalPaginas,
            totalElementos: count,
            elementosPorPagina: parseInt(limite),
            tieneSiguiente: pagina < totalPaginas,
            tieneAnterior: pagina > 1
          }
        }
      });

    } catch (error) {
      console.error('❌ Error al obtener productos:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/productos/:id - Obtener un producto por ID
  static async obtenerProducto(req, res) {
    try {
      const { id } = req.params;

      const producto = await Producto.findByPk(id, {
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        }
      });

      if (!producto) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Producto no encontrado'
        });
      }

      res.json({
        exito: true,
        datos: producto
      });

    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // POST /api/productos - Crear nuevo producto (requiere auth admin)
  static async crearProducto(req, res) {
    try {
      const {
        nombre,
        descripcion,
        categoria,
        precio,
        imagen,
        stock = 0,
        color,
        talla,
        material
      } = req.body;

      // Validaciones básicas
      if (!nombre || !categoria || !precio) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Nombre, categoría y precio son campos obligatorios'
        });
      }

      if (!['ropa', 'accesorios'].includes(categoria)) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Categoría debe ser "ropa" o "accesorios"'
        });
      }

      if (precio < 0) {
        return res.status(400).json({
          exito: false,
          mensaje: 'El precio no puede ser negativo'
        });
      }

      const nuevoProducto = await Producto.create({
        nombre,
        descripcion,
        categoria,
        precio: parseFloat(precio),
        imagen: imagen || '/img/default-product.png',
        stock: parseInt(stock),
        color,
        talla,
        material,
        activo: true  // ✅ Productos nuevos activos por defecto
      });

      res.status(201).json({
        exito: true,
        mensaje: 'Producto creado exitosamente',
        datos: nuevoProducto
      });

    } catch (error) {
      console.error('Error al crear producto:', error);
      
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
  }

  // PUT /api/productos/:id - Actualizar producto (requiere auth admin)
  static async actualizarProducto(req, res) {
    try {
      const { id } = req.params;
      const datosActualizacion = req.body;

      console.log('📝 Actualizando producto:', id, 'con datos:', datosActualizacion);

      const producto = await Producto.findByPk(id);

      if (!producto) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Producto no encontrado'
        });
      }

      // Validaciones si se actualiza categoría
      if (datosActualizacion.categoria && !['ropa', 'accesorios'].includes(datosActualizacion.categoria)) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Categoría debe ser "ropa" o "accesorios"'
        });
      }

      // Validaciones si se actualiza precio
      if (datosActualizacion.precio !== undefined && datosActualizacion.precio < 0) {
        return res.status(400).json({
          exito: false,
          mensaje: 'El precio no puede ser negativo'
        });
      }

      // Procesar datos numéricos
      if (datosActualizacion.precio) datosActualizacion.precio = parseFloat(datosActualizacion.precio);
      if (datosActualizacion.stock !== undefined) datosActualizacion.stock = parseInt(datosActualizacion.stock);

      await producto.update(datosActualizacion);
      await producto.reload(); // Recargar para obtener datos actualizados

      console.log(' Producto actualizado:', producto.toJSON());

      res.json({
        exito: true,
        mensaje: 'Producto actualizado exitosamente',
        datos: producto
      });

    } catch (error) {
      console.error('Error al actualizar producto:', error);
      
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
  }

  // DELETE /api/productos/:id - Eliminar producto (baja lógica)
  static async eliminarProducto(req, res) {
    try {
      const { id } = req.params;

      const producto = await Producto.findByPk(id);

      if (!producto) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Producto no encontrado'
        });
      }

      // Baja lógica - cambiar activo a false
      await producto.update({ activo: false });

      res.json({
        exito: true,
        mensaje: 'Producto desactivado exitosamente',
        datos: producto
      });

    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PATCH /api/productos/alternar/:id- Activar/Desactivar producto
  static async alternarProducto(req, res) {
    try {
      const { id } = req.params;

      console.log('🔄 Alternando estado del producto:', id);

      const producto = await Producto.findByPk(id);

      if (!producto) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Producto no encontrado'
        });
      }

      const estadoAnterior = producto.activo;

      // Cambiar estado activo
      await producto.update({ activo: !producto.activo });
      await producto.reload(); // Recargar para obtener el estado actualizado

      const mensaje = `Producto ${producto.activo ? 'activado' : 'desactivado'} exitosamente`;
      
      console.log(`✅ ${mensaje}. Estado: ${estadoAnterior} → ${producto.activo}`);

      res.json({
        exito: true,
        mensaje,
        datos: producto
      });

    } catch (error) {
      console.error('❌ Error al cambiar estado del producto:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Método para obtener todos los productos (usado en vistas del dashboard)
  static async obtenerTodos() {
    try {
      const productos = await Producto.findAll({
        where: { activo: true },
        order: [['createdAt', 'DESC']]
      });
      return productos;
    } catch (error) {
      console.error('Error al obtener todos los productos:', error);
      throw error;
    }
  }
}

module.exports = ControladorProducto;