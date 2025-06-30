const { validationResult } = require('express-validator');

// Lista temporal de productos hasta conectar con la base de datos
let productosTemp = [
  {
    id: 1,
    nombre: 'Remera Básica Data Dream',
    descripcion: 'Remera de algodón 100% con logo bordado',
    categoria: 'ropa',
    precio: 15000,
    imagen: '/img/img1.png',
    stock: 25,
    color: 'Negro',
    talla: 'M',
    material: 'Algodón 100%',
    activo: true
  },
  {
    id: 2,
    nombre: 'Gorra Snapback',
    descripcion: 'Gorra ajustable con visera plana',
    categoria: 'accesorios',
    precio: 12000,
    imagen: '/img/img-05.jpg',
    stock: 40,
    color: 'Negro',
    material: 'Algodón y Poliéster',
    activo: true
  },
  {
    id: 3,
    nombre: 'Buzo Premium',
    descripcion: 'Buzo con capucha de alta calidad',
    categoria: 'ropa',
    precio: 25000,
    imagen: '/img/img3.png',
    stock: 15,
    color: 'Gris',
    talla: 'XL',
    material: 'Algodón 80% - Poliéster 20%',
    activo: false // Para probar activar/desactivar
  }
];

class ControladorAdminVista {
  
  // ==========================================
  // VISTAS DE AUTENTICACIÓN
  // ==========================================
  
  static mostrarLogin(req, res) {
    const error = req.query.error || null;
    const success = req.query.success || null;
    
    res.render('admin/login', { 
      error, 
      success,
      formData: {}
    });
  }
  
  static mostrarRegistro(req, res) {
    const error = req.query.error || null;
    const success = req.query.success || null;
    
    res.render('admin/register', { 
      error, 
      success,
      errors: [],
      formData: {}
    });
  }
  
  // ==========================================
  // VISTAS DE DASHBOARD
  // ==========================================
  
  static mostrarDashboard(req, res) {
    const success = req.query.success || null;
    const error = req.query.error || null;
    
    res.render('admin/dashboard', { 
      usuario: req.usuario,
      titulo: 'Dashboard - DATA DREAM',
      productos: productosTemp,
      success,
      error
    });
  }
  
  // ==========================================
  // VISTAS DE PRODUCTOS
  // ==========================================
  
  static mostrarProductos(req, res) {
    // Redirigir al dashboard donde se muestran los productos
    res.redirect('/admin/dashboard');
  }
  
  static mostrarFormularioNuevo(req, res) {
    const error = req.query.error || null;
    
    res.render('admin/productos', {
      usuario: req.usuario,
      titulo: 'Nuevo Producto - DATA DREAM',
      accion: 'crear',
      producto: null,
      categorias: [
        { valor: 'ropa', texto: 'Ropa' },
        { valor: 'accesorios', texto: 'Accesorios' }
      ],
      error,
      errores: []
    });
  }
  
  static mostrarFormularioEditar(req, res) {
    try {
      const id = parseInt(req.params.id);
      const producto = productosTemp.find(p => p.id === id);
      
      if (!producto) {
        return res.redirect('/admin/productos?error=Producto no encontrado');
      }
      
      const error = req.query.error || null;
      
      res.render('admin/productos', {
        usuario: req.usuario,
        titulo: 'Editar Producto - DATA DREAM',
        accion: 'editar',
        producto,
        categorias: [
          { valor: 'ropa', texto: 'Ropa' },
          { valor: 'accesorios', texto: 'Accesorios' }
        ],
        error,
        errores: []
      });
      
    } catch (error) {
      console.error('Error al mostrar formulario de edición:', error);
      res.redirect('/admin/productos?error=Error interno del servidor');
    }
  }
  
  // ==========================================
  // PROCESAMIENTO DE PRODUCTOS
  // ==========================================
  
  static crearProducto(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('admin/productos', {
          usuario: req.usuario,
          titulo: 'Nuevo Producto - DATA DREAM',
          accion: 'crear',
          producto: req.body,
          categorias: [
            { valor: 'ropa', texto: 'Ropa' },
            { valor: 'accesorios', texto: 'Accesorios' }
          ],
          error: null,
          errores: errors.array()
        });
      }
      
      const { nombre, descripcion, categoria, precio, stock, color, talla, material } = req.body;
      
      // Crear nuevo producto
      const nuevoProducto = {
        id: Math.max(...productosTemp.map(p => p.id)) + 1,
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || '',
        categoria,
        precio: parseFloat(precio),
        stock: parseInt(stock) || 0,
        color: color?.trim() || '',
        talla: talla?.trim() || '',
        material: material?.trim() || '',
        imagen: req.file ? `/uploads/productos/${req.file.filename}` : '/img/default-product.png',
        activo: true
      };
      
      productosTemp.push(nuevoProducto);
      
      console.log('✅ Producto creado:', nuevoProducto);
      
      res.redirect('/admin/productos?success=Producto creado exitosamente');
      
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.render('admin/productos', {
        usuario: req.usuario,
        titulo: 'Nuevo Producto - DATA DREAM',
        accion: 'crear',
        producto: req.body,
        categorias: [
          { valor: 'ropa', texto: 'Ropa' },
          { valor: 'accesorios', texto: 'Accesorios' }
        ],
        error: 'Error interno del servidor',
        errores: []
      });
    }
  }
  
  static actualizarProducto(req, res) {
    try {
      const id = parseInt(req.params.id);
      const productoIndex = productosTemp.findIndex(p => p.id === id);
      
      if (productoIndex === -1) {
        return res.redirect('/admin/productos?error=Producto no encontrado');
      }
      
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const producto = productosTemp[productoIndex];
        return res.render('admin/productos', {
          usuario: req.usuario,
          titulo: 'Editar Producto - DATA DREAM',
          accion: 'editar',
          producto: { ...producto, ...req.body },
          categorias: [
            { valor: 'ropa', texto: 'Ropa' },
            { valor: 'accesorios', texto: 'Accesorios' }
          ],
          error: null,
          errores: errors.array()
        });
      }
      
      const { nombre, descripcion, categoria, precio, stock, color, talla, material } = req.body;
      
      // Actualizar producto
      productosTemp[productoIndex] = {
        ...productosTemp[productoIndex],
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || '',
        categoria,
        precio: parseFloat(precio),
        stock: parseInt(stock) || 0,
        color: color?.trim() || '',
        talla: talla?.trim() || '',
        material: material?.trim() || '',
        imagen: req.file ? `/uploads/productos/${req.file.filename}` : productosTemp[productoIndex].imagen
      };
      
      console.log('✅ Producto actualizado:', productosTemp[productoIndex]);
      
      res.redirect('/admin/productos?success=Producto actualizado exitosamente');
      
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.redirect('/admin/productos?error=Error interno del servidor');
    }
  }
  
  static alternarEstadoProducto(req, res) {
    try {
      const id = parseInt(req.params.id);
      const producto = productosTemp.find(p => p.id === id);
      
      if (!producto) {
        return res.redirect('/admin/productos?error=Producto no encontrado');
      }
      
      // Cambiar estado
      producto.activo = !producto.activo;
      
      const mensaje = producto.activo ? 'activado' : 'desactivado';
      console.log(`✅ Producto ${mensaje}:`, producto);
      
      res.redirect(`/admin/productos?success=Producto ${mensaje} exitosamente`);
      
    } catch (error) {
      console.error('Error al cambiar estado del producto:', error);
      res.redirect('/admin/productos?error=Error interno del servidor');
    }
  }
  
  static eliminarProducto(req, res) {
    try {
      const id = parseInt(req.params.id);
      const producto = productosTemp.find(p => p.id === id);
      
      if (!producto) {
        return res.redirect('/admin/productos?error=Producto no encontrado');
      }
      
      // Baja lógica
      producto.activo = false;
      
      console.log('✅ Producto eliminado (baja lógica):', producto);
      
      res.redirect('/admin/productos?success=Producto eliminado exitosamente');
      
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.redirect('/admin/productos?error=Error interno del servidor');
    }
  }
}

module.exports = ControladorAdminVista;