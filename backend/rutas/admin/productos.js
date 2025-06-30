const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Iniciando servidor DATA DREAM...');

// ============================================
// CONFIGURACIÓN BÁSICA
// ============================================

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// CONFIGURAR EJS
// ============================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'vista'));

console.log('📁 Views directory:', path.join(__dirname, 'vista'));

// ============================================
// ARCHIVOS ESTÁTICOS
// ============================================

// Crear directorios si no existen
const createDirectories = () => {
  const dirs = [
    'uploads/productos',
    'estaticos/css',
    'estaticos/js', 
    'estaticos/img'
  ];
  
  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Directorio creado: ${dir}`);
    }
  });
};

createDirectories();

app.use('/css', express.static(path.join(__dirname, 'estaticos/css')));
app.use('/js', express.static(path.join(__dirname, 'estaticos/js')));
app.use('/img', express.static(path.join(__dirname, 'estaticos/img')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/favicon.png', express.static(path.join(__dirname, 'estaticos/img/favicon.png')));

// ============================================
// CONFIGURACIÓN DE MULTER PARA PRODUCTOS
// ============================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/productos/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'producto-' + uniqueSuffix + path.extname(file.originalname));
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

// ============================================
// PRODUCTOS TEMPORALES (HASTA CONECTAR BD)
// ============================================

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
    descripcion: 'Buzo de alta calidad con capucha',
    categoria: 'ropa',
    precio: 25000,
    imagen: '/img/img3.png',
    stock: 15,
    color: 'Gris',
    talla: 'XL',
    material: 'Algodón 80% - Poliéster 20%',
    activo: false
  }
];

// ============================================
// MIDDLEWARE TEMPORAL HASTA TENER BD
// ============================================

const middlewareAuthTemp = (req, res, next) => {
  const token = req.cookies['admin-token'] || req.headers.authorization?.replace('Bearer ', '');
  
  if (token === 'admin-logueado' || token) {
    req.usuario = {
      id: 1,
      nombre: 'Admin',
      apellido: 'Sistema',
      email: 'admin@datadream.com',
      rol: 'super_admin'
    };
  }
  next();
};

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

// GET /admin/login - Mostrar formulario de login
app.get('/admin/login', (req, res) => {
  console.log('📍 GET /admin/login');
  const error = req.query.error || null;
  const success = req.query.success || null;
  
  res.render('admin/login', { 
    titulo: 'Iniciar Sesión - DATA DREAM',
    error, 
    success,
    formData: {}
  });
});

// GET /admin/register - Mostrar formulario de registro
app.get('/admin/register', (req, res) => {
  console.log('📍 GET /admin/register');
  const error = req.query.error || null;
  const success = req.query.success || null;
  
  res.render('admin/register', {
    titulo: 'Registro - DATA DREAM',
    error,
    success,
    errors: [],
    formData: {}
  });
});

// POST /admin/auth/login - Procesar login
app.post('/admin/auth/login', (req, res) => {
  console.log('📍 POST /admin/auth/login');
  const { email, password } = req.body;
  
  console.log('🔍 Intento de login:', { email, password: '***' });
  
  if (email === 'admin@datadream.com' && password === 'admin123') {
    console.log('✅ Login exitoso');
    
    res.cookie('admin-token', 'admin-logueado', {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.redirect('/admin/dashboard');
  } else {
    console.log('❌ Credenciales incorrectas');
    res.redirect('/admin/login?error=Credenciales incorrectas');
  }
});

// POST /admin/auth/registro - Procesar registro
app.post('/admin/auth/registro', (req, res) => {
  console.log('📍 POST /admin/auth/registro');
  const { nombre, apellido, email, password } = req.body;
  
  // Validaciones básicas
  const errors = [];
  
  if (!nombre || nombre.trim().length < 2) {
    errors.push({ msg: 'El nombre debe tener al menos 2 caracteres' });
  }
  
  if (!apellido || apellido.trim().length < 2) {
    errors.push({ msg: 'El apellido debe tener al menos 2 caracteres' });
  }
  
  if (!email || !email.includes('@')) {
    errors.push({ msg: 'Email inválido' });
  }
  
  if (!password || password.length < 6) {
    errors.push({ msg: 'La contraseña debe tener al menos 6 caracteres' });
  }
  
  if (errors.length > 0) {
    return res.render('admin/register', {
      titulo: 'Registro - DATA DREAM',
      error: null,
      success: null,
      errors,
      formData: { nombre, apellido, email }
    });
  }
  
  // Verificar si el usuario ya existe (simulado)
  if (email === 'admin@datadream.com') {
    return res.render('admin/register', {
      titulo: 'Registro - DATA DREAM',
      error: 'Ya existe un usuario con este email',
      success: null,
      errors: [],
      formData: req.body
    });
  }
  
  // Simular creación exitosa
  console.log('✅ Usuario registrado:', { nombre, apellido, email });
  
  res.redirect('/admin/login?success=Usuario registrado correctamente. Puedes iniciar sesión.');
});

// ============================================
// RUTAS DEL DASHBOARD
// ============================================

// GET /admin/dashboard - Dashboard principal
app.get('/admin/dashboard', middlewareAuthTemp, (req, res) => {
  console.log('📍 GET /admin/dashboard');
  
  if (!req.usuario) {
    return res.redirect('/admin/login?error=Debes iniciar sesión');
  }
  
  const success = req.query.success || null;
  const error = req.query.error || null;
  
  res.render('admin/dashboard', { 
    titulo: 'Dashboard - DATA DREAM',
    usuario: req.usuario,
    productos: productosTemp,
    success,
    error
  });
});

// ============================================
// RUTAS DE PRODUCTOS
// ============================================

// GET /admin/productos/nuevo - Formulario nuevo producto
app.get('/admin/productos/nuevo', middlewareAuthTemp, (req, res) => {
  console.log('📍 GET /admin/productos/nuevo');
  
  if (!req.usuario) {
    return res.redirect('/admin/login?error=Debes iniciar sesión');
  }
  
  const error = req.query.error || null;
  
  res.render('admin/productos', {
    titulo: 'Nuevo Producto - DATA DREAM',
    usuario: req.usuario,
    accion: 'crear',
    producto: null,
    categorias: [
      { valor: 'ropa', texto: 'Ropa' },
      { valor: 'accesorios', texto: 'Accesorios' }
    ],
    error,
    errores: []
  });
});

// GET /admin/productos/:id/editar - Formulario editar producto
app.get('/admin/productos/:id/editar', middlewareAuthTemp, (req, res) => {
  console.log('📍 GET /admin/productos/:id/editar');
  
  if (!req.usuario) {
    return res.redirect('/admin/login?error=Debes iniciar sesión');
  }
  
  const id = parseInt(req.params.id);
  const producto = productosTemp.find(p => p.id === id);
  
  if (!producto) {
    return res.redirect('/admin/dashboard?error=Producto no encontrado');
  }
  
  const error = req.query.error || null;
  
  res.render('admin/productos', {
    titulo: 'Editar Producto - DATA DREAM',
    usuario: req.usuario,
    accion: 'editar',
    producto,
    categorias: [
      { valor: 'ropa', texto: 'Ropa' },
      { valor: 'accesorios', texto: 'Accesorios' }
    ],
    error,
    errores: []
  });
});

// POST /admin/productos - Crear producto
app.post('/admin/productos', middlewareAuthTemp, upload.single('imagen'), (req, res) => {
  console.log('📍 POST /admin/productos (crear)');
  
  if (!req.usuario) {
    return res.redirect('/admin/login?error=Debes iniciar sesión');
  }
  
  const { nombre, descripcion, categoria, precio, stock, color, talla, material } = req.body;
  
  console.log('📊 Datos recibidos:', req.body);
  console.log('📁 Archivo:', req.file ? req.file.filename : 'No hay archivo');
  
  // Validaciones
  const errores = [];
  
  if (!nombre || nombre.trim().length < 2) {
    errores.push({ msg: 'El nombre debe tener al menos 2 caracteres' });
  }
  
  if (!categoria || !['ropa', 'accesorios'].includes(categoria)) {
    errores.push({ msg: 'Categoría inválida' });
  }
  
  if (!precio || isNaN(precio) || parseFloat(precio) < 0) {
    errores.push({ msg: 'El precio debe ser un número válido mayor a 0' });
  }
  
  if (!stock || isNaN(stock) || parseInt(stock) < 0) {
    errores.push({ msg: 'El stock debe ser un número entero mayor o igual a 0' });
  }
  
  if (errores.length > 0) {
    return res.render('admin/productos', {
      titulo: 'Nuevo Producto - DATA DREAM',
      usuario: req.usuario,
      accion: 'crear',
      producto: req.body,
      categorias: [
        { valor: 'ropa', texto: 'Ropa' },
        { valor: 'accesorios', texto: 'Accesorios' }
      ],
      error: null,
      errores
    });
  }
  
  // Crear nuevo producto
  const nuevoProducto = {
    id: Math.max(...productosTemp.map(p => p.id)) + 1,
    nombre: nombre.trim(),
    descripcion: descripcion?.trim() || '',
    categoria,
    precio: parseFloat(precio),
    stock: parseInt(stock),
    color: color?.trim() || '',
    talla: talla?.trim() || '',
    material: material?.trim() || '',
    imagen: req.file ? `/uploads/productos/${req.file.filename}` : '/img/default-product.png',
    activo: true
  };
  
  productosTemp.push(nuevoProducto);
  
  console.log('✅ Producto creado:', nuevoProducto);
  
  res.redirect('/admin/dashboard?success=Producto creado exitosamente');
});

// POST /admin/productos/:id - Actualizar producto
app.post('/admin/productos/:id', middlewareAuthTemp, upload.single('imagen'), (req, res) => {
  console.log('📍 POST /admin/productos/:id (actualizar)');
  
  if (!req.usuario) {
    return res.redirect('/admin/login?error=Debes iniciar sesión');
  }
  
  const id = parseInt(req.params.id);
  const productoIndex = productosTemp.findIndex(p => p.id === id);
  
  if (productoIndex === -1) {
    return res.redirect('/admin/dashboard?error=Producto no encontrado');
  }
  
  const { nombre, descripcion, categoria, precio, stock, color, talla, material } = req.body;
  
  console.log('📊 Datos de actualización:', req.body);
  console.log('📁 Archivo:', req.file ? req.file.filename : 'No hay archivo nuevo');
  
  // Validaciones
  const errores = [];
  
  if (!nombre || nombre.trim().length < 2) {
    errores.push({ msg: 'El nombre debe tener al menos 2 caracteres' });
  }
  
  if (!categoria || !['ropa', 'accesorios'].includes(categoria)) {
    errores.push({ msg: 'Categoría inválida' });
  }
  
  if (!precio || isNaN(precio) || parseFloat(precio) < 0) {
    errores.push({ msg: 'El precio debe ser un número válido mayor a 0' });
  }
  
  if (!stock || isNaN(stock) || parseInt(stock) < 0) {
    errores.push({ msg: 'El stock debe ser un número entero mayor o igual a 0' });
  }
  
  if (errores.length > 0) {
    const producto = productosTemp[productoIndex];
    return res.render('admin/productos', {
      titulo: 'Editar Producto - DATA DREAM',
      usuario: req.usuario,
      accion: 'editar',
      producto: { ...producto, ...req.body },
      categorias: [
        { valor: 'ropa', texto: 'Ropa' },
        { valor: 'accesorios', texto: 'Accesorios' }
      ],
      error: null,
      errores
    });
  }
  
  // Actualizar producto
  productosTemp[productoIndex] = {
    ...productosTemp[productoIndex],
    nombre: nombre.trim(),
    descripcion: descripcion?.trim() || '',
    categoria,
    precio: parseFloat(precio),
    stock: parseInt(stock),
    color: color?.trim() || '',
    talla: talla?.trim() || '',
    material: material?.trim() || '',
    imagen: req.file ? `/uploads/productos/${req.file.filename}` : productosTemp[productoIndex].imagen
  };
  
  console.log('✅ Producto actualizado:', productosTemp[productoIndex]);
  
  res.redirect('/admin/dashboard?success=Producto actualizado exitosamente');
});

// POST /admin/productos/:id/alternar - Activar/Desactivar producto
app.post('/admin/productos/:id/alternar', middlewareAuthTemp, (req, res) => {
  console.log('📍 POST /admin/productos/:id/alternar');
  
  if (!req.usuario) {
    return res.redirect('/admin/login?error=Debes iniciar sesión');
  }
  
  const id = parseInt(req.params.id);
  const producto = productosTemp.find(p => p.id === id);
  
  if (!producto) {
    return res.redirect('/admin/dashboard?error=Producto no encontrado');
  }
  
  // Cambiar estado
  producto.activo = !producto.activo;
  
  const mensaje = producto.activo ? 'activado' : 'desactivado';
  console.log(`✅ Producto ${mensaje}:`, producto);
  
  res.redirect(`/admin/dashboard?success=Producto ${mensaje} exitosamente`);
});

// GET /admin/logout - Cerrar sesión
app.get('/admin/logout', (req, res) => {
  console.log('📍 GET /admin/logout');
  res.clearCookie('admin-token');
  res.redirect('/admin/login?success=Sesión cerrada correctamente');
});

// ============================================
// RUTAS API
// ============================================

// Verificar si existen los archivos de rutas API
const rutasProductosPath = path.join(__dirname, 'rutas/api/productos.js');
const rutasVentasPath = path.join(__dirname, 'rutas/api/ventas.js');

if (fs.existsSync(rutasProductosPath)) {
  console.log('✅ Cargando rutas API productos');
  const rutasProductos = require('./rutas/api/productos');
  app.use('/api/productos', rutasProductos);
} else {
  console.log('❌ No se encontró rutas/api/productos.js');
  // Ruta temporal
  app.get('/api/productos', (req, res) => {
    const { categoria, pagina = 1, limite = 10 } = req.query;
    
    let productos = productosTemp.filter(p => p.activo);
    
    if (categoria && categoria !== 'todos') {
      productos = productos.filter(p => p.categoria === categoria);
    }
    
    res.json({
      exito: true,
      datos: {
        productos,
        paginacion: {
          paginaActual: parseInt(pagina),
          totalPaginas: 1,
          totalElementos: productos.length,
          tieneAnterior: false,
          tieneSiguiente: false
        }
      }
    });
  });
}

if (fs.existsSync(rutasVentasPath)) {
  console.log('✅ Cargando rutas API ventas');
  const rutasVentas = require('./rutas/api/ventas');
  app.use('/api/ventas', rutasVentas);
} else {
  console.log('❌ No se encontró rutas/api/ventas.js');
  // Ruta temporal
  app.post('/api/ventas', (req, res) => {
    const numeroVenta = `VTA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    res.status(201).json({
      exito: true,
      mensaje: 'Venta creada exitosamente',
      datos: {
        id: Math.floor(Math.random() * 1000),
        numeroVenta,
        ...req.body,
        fechaVenta: new Date().toISOString()
      }
    });
  });
}

// ============================================
// RUTA PRINCIPAL
// ============================================

app.get('/', (req, res) => {
  console.log('📍 GET /');
  res.json({
    mensaje: 'DATA DREAM Backend API',
    version: '1.0.0',
    autor: 'Yamila Sueldo',
    frontend: 'http://localhost:5173',
    admin: 'http://localhost:3000/admin/login',
    estado: 'funcionando'
  });
});

// ============================================
// MANEJO DE ERRORES 404
// ============================================

app.use((req, res) => {
  console.log(`❌ 404 - Ruta no encontrada: ${req.method} ${req.path}`);
  
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      exito: false,
      mensaje: 'Endpoint no encontrado',
      ruta: req.path
    });
  } else if (req.path.startsWith('/admin/')) {
    res.status(404).send(`
      <h1>Error 404</h1>
      <p>Página no encontrada: ${req.path}</p>
      <a href="/admin/login">← Volver al login</a>
    `);
  } else {
    res.status(404).json({
      exito: false,
      mensaje: 'Ruta no encontrada',
      sugerencia: 'Frontend en http://localhost:5173'
    });
  }
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`
🎉 ¡Servidor DATA DREAM iniciado exitosamente!

📍 URLs disponibles:
   🏠 Aplicación Cliente: http://localhost:5173/
   🔐 Login Admin: http://localhost:${PORT}/admin/login
   📊 Dashboard Admin: http://localhost:${PORT}/admin/dashboard
   ➕ Nuevo Producto: http://localhost:${PORT}/admin/productos/nuevo
   🔌 API Base: http://localhost:${PORT}/

👤 Credenciales admin:
   📧 Email: admin@datadream.com
   🔒 Password: admin123

🛠️  Desarrollado por: Yamila Sueldo
  `);
});