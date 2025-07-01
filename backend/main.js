const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config();

// Importar configuración de base de datos
const { connectDB } = require('./config/database');

// Importar rutas API
const rutasProductos = require('./rutas/api/productos');
const rutasVentas = require('./rutas/api/ventas');
const rutasAuth = require('./rutas/api/auth');

// Importar middlewares
const { verificarAuth, verificarAdmin } = require('./middleware/middlewareAuth');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'clave_super_secreta_pero_enserio';

// ============================================
// CONFIGURACIÓN DE MIDDLEWARES
// ============================================

// Seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Cookies y parsing
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============================================
// CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS
// ============================================

app.use('/css', express.static(path.join(__dirname, 'estaticos/css')));
app.use('/js', express.static(path.join(__dirname, 'estaticos/js')));
app.use('/img', express.static(path.join(__dirname, 'estaticos/img')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/estaticos', express.static(path.join(__dirname, 'estaticos')));
app.use('/favicon.png', express.static(path.join(__dirname, 'estaticos/img/favicon.png')));

// ============================================
// CONFIGURACIÓN DE EJS
// ============================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'vista/admin'));

// ============================================
// CONFIGURACIÓN DE MULTER
// ============================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/productos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'producto-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// ============================================
// MIDDLEWARES PERSONALIZADOS
// ============================================

// Middleware para verificar autenticación en rutas EJS
const verificarAuthEJS = (req, res, next) => {
  const token = req.cookies['admin-token'];
  
  if (!token) {
    return res.redirect('/admin/login?error=Debes iniciar sesión para acceder');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    res.clearCookie('admin-token');
    res.redirect('/admin/login?error=Sesión expirada');
  }
};

// ============================================
// RUTAS API REST
// ============================================

app.use('/api/productos', rutasProductos);
app.use('/api/ventas', rutasVentas);
app.use('/api/auth', rutasAuth);

// Ruta para subir imágenes de productos
app.post('/api/upload/producto', 
  verificarAuth,
  verificarAdmin,
  upload.single('imagen'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          exito: false,
          mensaje: 'No se ha subido ningún archivo'
        });
      }

      const imageUrl = `/uploads/productos/${req.file.filename}`;
      
      res.json({
        exito: true,
        mensaje: 'Imagen subida exitosamente',
        datos: {
          url: imageUrl,
          nombre: req.file.filename,
          tamano: req.file.size
        }
      });
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al subir la imagen',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// ============================================
// RUTAS DE AUTENTICACIÓN (EJS)
// ============================================

// Login (GET)
app.get('/admin/login', (req, res) => {
  res.render('login', { 
    titulo: 'Iniciar Sesión - DATA DREAM',
    error: req.query.error || null,
    success: req.query.success || null,
    formData: {}
  });
});

// Registro de administrador (GET)
app.get('/admin/register', (req, res) => {
  res.render('register', { 
    error: req.query.error,
    success: req.query.success,
    titulo: 'Registro - DATA DREAM'
  });
});

// Procesamiento del registro (POST)
app.post('/admin/auth/registro', async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body;
    
    // Validaciones básicas
    if (!nombre || !apellido || !email || !password) {
      return res.render('register', {
        error: 'Todos los campos son obligatorios',
        formData: req.body,
        titulo: 'Registro - DATA DREAM'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render('register', {
        error: 'Formato de email inválido',
        formData: req.body,
        titulo: 'Registro - DATA DREAM'
      });
    }

    // Validar contraseña (mínimo 6 caracteres, mayúscula, minúscula, número)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.render('register', {
        error: 'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número',
        formData: req.body,
        titulo: 'Registro - DATA DREAM'
      });
    }

    // Crear usuario usando la API
    const response = await fetch('http://localhost:3000/api/auth/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, apellido, email, password })
    });

    const result = await response.json();

    if (response.ok) {
      // Registro exitoso
      res.redirect('/admin/login?success=Usuario creado exitosamente. Ya puedes iniciar sesión.');
    } else {
      // Error en el registro
      res.render('register', {
        error: result.mensaje || 'Error al crear el usuario',
        formData: req.body,
        titulo: 'Registro - DATA DREAM'
      });
    }

  } catch (error) {
    console.error('Error en registro:', error);
    res.render('register', {
      error: 'Error interno del servidor',
      formData: req.body,
      titulo: 'Registro - DATA DREAM'
    });
  }
});

// Procesamiento del login (POST)
app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validaciones básicas
    if (!email || !password) {
      return res.render('login', {
        titulo: 'Iniciar Sesión - DATA DREAM',
        error: 'Email y contraseña son requeridos',
        success: null,
        formData: { email }
      });
    }

    // Hacer solicitud a la API interna
    const response = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.ok) {
      // Login exitoso - configurar cookie
      res.cookie('admin-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });
      
      res.redirect('/admin/dashboard?success=Bienvenido al panel de administración');
    } else {
      res.render('login', {
        titulo: 'Iniciar Sesión - DATA DREAM',
        error: result.mensaje || 'Credenciales incorrectas',
        success: null,
        formData: { email }
      });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.render('login', {
      titulo: 'Iniciar Sesión - DATA DREAM',
      error: 'Error interno del servidor',
      success: null,
      formData: req.body
    });
  }
});

// ============================================
// RUTAS DEL PANEL DE ADMINISTRACIÓN
// ============================================

// Dashboard principal
app.get('/admin/dashboard', verificarAuthEJS, (req, res) => {
  res.render('dashboard', { 
    usuario: req.usuario,
    titulo: 'Dashboard - DATA DREAM',
    success: req.query.success || null,
    error: req.query.error || null
  });
});

// Productos - Nuevo
app.get('/admin/productos/nuevo', verificarAuthEJS, (req, res) => {
  res.render('productos', {
    usuario: req.usuario,
    titulo: 'Nuevo Producto - DATA DREAM',
    accion: 'crear',
    producto: null,
    categorias: [
      { valor: 'ropa', texto: 'Ropa' },
      { valor: 'accesorios', 
        texto: 'Accesorios' }
    ],
    error: null,
    errores: [],
    success: null
  });
});

// Productos - Editar
app.get('/admin/productos/:id/editar', verificarAuthEJS, async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await fetch(`http://localhost:${PORT}/api/productos/${id}`);
    const data = await response.json();
    
    if (!data.exito) {
      return res.redirect('/admin/dashboard?error=Producto no encontrado');
    }
    
    res.render('productos', {
      usuario: req.usuario,
      titulo: 'Editar Producto - DATA DREAM',
      accion: 'editar',
      producto: data.datos,
      categorias: [
        { valor: 'ropa', texto: 'Ropa' },
        { valor: 'accesorios', texto: 'Accesorios' }
      ],
      error: null,
      errores: [],
      success: null
    });
    
  } catch (error) {
    console.error('Error al cargar producto:', error);
    res.redirect('/admin/dashboard?error=Error al cargar el producto');
  }
});

// Procesamiento de productos - Crear
app.post('/admin/productos', 
  verificarAuthEJS,
  upload.single('imagen'),
  async (req, res) => {
    try {
      const productData = { ...req.body };
      
      if (req.file) {
        productData.imagen = `/uploads/productos/${req.file.filename}`;
      }

      const response = await fetch(`http://localhost:${PORT}/api/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const result = await response.json();

      if (result.exito) {
        res.redirect('/admin/dashboard?success=Producto creado exitosamente');
      } else {
        res.render('productos', {
          usuario: req.usuario,
          titulo: 'Nuevo Producto - DATA DREAM',
          accion: 'crear',
          producto: null,
          categorias: [
            { valor: 'ropa', texto: 'Ropa' },
            { valor: 'accesorios', texto: 'Accesorios' }
          ],
          error: result.mensaje || 'Error al crear el producto',
          errores: result.errores || [],
          success: null
        });
      }
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.redirect('/admin/dashboard?error=Error interno del servidor');
    }
  }
);

// Procesamiento de productos - Editar
app.post('/admin/productos/:id', 
  verificarAuthEJS,
  upload.single('imagen'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const productData = { ...req.body };
      
      if (req.file) {
        productData.imagen = `/uploads/productos/${req.file.filename}`;
      }

      const response = await fetch(`http://localhost:${PORT}/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const result = await response.json();

      if (result.exito) {
        res.redirect('/admin/dashboard?success=Producto actualizado exitosamente');
      } else {
        // Recargar producto en caso de error
        const productResponse = await fetch(`http://localhost:${PORT}/api/productos/${id}`);
        const productData = await productResponse.json();
        
        res.render('productos', {
          usuario: req.usuario,
          titulo: 'Editar Producto - DATA DREAM',
          accion: 'editar',
          producto: productData.exito ? productData.datos : null,
          categorias: [
            { valor: 'ropa', texto: 'Ropa' },
            { valor: 'accesorios', texto: 'Accesorios' }
          ],
          error: result.mensaje || 'Error al actualizar el producto',
          errores: result.errores || [],
          success: null
        });
      }
    } catch (error) {
      console.error('Error al editar producto:', error);
      res.redirect('/admin/dashboard?error=Error interno del servidor');
    }
  }
);

// Ventas
app.get('/admin/ventas', verificarAuthEJS, (req, res) => {
  res.render('ventas', {
    usuario: req.usuario,
    titulo: 'Ventas - DATA DREAM'
  });
});

// Logout
app.post('/admin/logout', (req, res) => {
  res.clearCookie('admin-token');
  res.redirect('/admin/login?success=Sesión cerrada correctamente');
});

app.get('/admin/logout', (req, res) => {
  res.clearCookie('admin-token');
  res.redirect('/admin/login?success=Sesión cerrada correctamente');
});

// ============================================
// RUTAS DE DESARROLLO (TEMPORAL)
// ============================================

// Ruta de acceso rápido para testing
app.get('/admin/quick-access', (req, res) => {
  console.log('🚀 Acceso rápido activado');
  const testToken = jwt.sign(
    { 
      id: 1, 
      email: 'admin@datadream.com', 
      rol: 'admin',
      nombre: 'Admin',
      apellido: 'Test'
    }, 
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.cookie('admin-token', testToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  });
  res.redirect('/admin/dashboard?success=Acceso rápido activado');
});

// Ruta dashboard de prueba sin autenticación
app.get('/admin/dashboard-test', (req, res) => {
  const usuarioTest = {
    id: 1,
    email: 'admin@datadream.com',
    rol: 'admin',
    nombre: 'Yamila',
    apellido: 'Sueldo'
  };
  
  res.render('dashboard', { 
    usuario: usuarioTest,
    titulo: 'Dashboard - DATA DREAM',
    success: req.query.success || null,
    error: req.query.error || null
  });
});

// ============================================
// RUTA PRINCIPAL
// ============================================

app.get('/', (req, res) => {
  res.json({
    mensaje: 'DATA DREAM Backend API',
    version: '1.0.0',
    autor: 'Yamila Sueldo',
    urls: {
      frontend: 'http://localhost:5173',
      admin: `http://localhost:${PORT}/admin/login`,
      dashboard: `http://localhost:${PORT}/admin/dashboard`,
      quickAccess: `http://localhost:${PORT}/admin/quick-access`
    },
    api: {
      productos: '/api/productos',
      ventas: '/api/ventas',
      auth: '/api/auth'
    },
    estado: 'funcionando'
  });
});

// ============================================
// MANEJO DE ERRORES
// ============================================

// Middleware de errores de multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        exito: false,
        mensaje: 'El archivo es demasiado grande. Máximo 5MB'
      });
    }
  }
  
  if (error.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({
      exito: false,
      mensaje: error.message
    });
  }

  next(error);
});

// Middleware general de errores
app.use((err, req, res, next) => {
  console.error('❌ Error capturado:', err.stack);
  
  if (req.path.startsWith('/api/')) {
    res.status(err.status || 500).json({
      exito: false,
      mensaje: err.message || 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  } else if (req.path.startsWith('/admin/')) {
    res.status(err.status || 500).render('error', {
      usuario: req.usuario || null,
      titulo: 'Error - DATA DREAM',
      error: {
        status: err.status || 500,
        message: err.message || 'Error interno del servidor'
      }
    });
  } else {
    res.status(404).json({
      exito: false,
      mensaje: 'Ruta no encontrada',
      sugerencia: 'Frontend en http://localhost:5173'
    });
  }
});

// Middleware para rutas no encontradas (404)
app.use('*', (req, res) => {
  if (req.path.startsWith('/admin/')) {
    res.status(404).render('error', {
      usuario: req.usuario || null,
      titulo: 'Página no encontrada - DATA DREAM',
      error: {
        status: 404,
        message: 'La página que buscas no existe'
      }
    });
  } else {
    res.status(404).json({
      exito: false,
      mensaje: 'Ruta no encontrada',
      sugerencia: 'Frontend en http://localhost:5173'
    });
  }
});

// ============================================
// INICIALIZACIÓN DEL SERVIDOR
// ============================================

const crearDirectorios = () => {
  const directorios = [
    path.join(__dirname, 'uploads/productos'),
    path.join(__dirname, 'estaticos/css'),
    path.join(__dirname, 'estaticos/js'),
    path.join(__dirname, 'estaticos/img'),
    path.join(__dirname, 'vista/admin')
  ];
  
  directorios.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Directorio creado: ${dir}`);
    }
  });
};

const startServer = async () => {
  try {
    // Crear directorios necesarios
    crearDirectorios();
    
    // Conectar a la base de datos (descomentado cuando esté listo)
    // await connectDB();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
🎉 ¡Servidor DATA DREAM iniciado exitosamente!
📍 URLs disponibles:
   🏠 Frontend:          http://localhost:5173/
   🔐 Admin Login:       http://localhost:${PORT}/admin/login
   📊 Admin Dashboard:   http://localhost:${PORT}/admin/dashboard
   ⚡ Acceso Rápido:     http://localhost:${PORT}/admin/quick-access
   🔌 API Info:          http://localhost:${PORT}/

👤 Credenciales de desarrollo:
   📧 Email: admin@datadream.com
   🔒 Password: admin123

🛠️  Desarrollado por: Yamila Sueldo
      `);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Exportar para testing
module.exports = app;

// Iniciar servidor si no está siendo importado
if (require.main === module) {
  startServer();
}