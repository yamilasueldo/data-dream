const { sequelize, Usuario, Producto } = require('./modelos');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    console.log(' Iniciando configuración automática de DATA DREAM...');
    
    // Verificar que existe el archivo .env
    if (!fs.existsSync('.env')) {
      console.log('⚠️  No se encontró archivo .env, creando uno por defecto...');
      await crearArchivoEnv();
    }
    
    // Crear directorios necesarios
    await crearDirectorios();
    
    console.log(' Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente');
    
    // Mostrar información de conexión
    console.log(`📊 Información de conexión:
   - Dialecto: ${sequelize.getDialect()}
   - Host: ${process.env.DB_HOST || 'localhost'}
   - Puerto: ${process.env.DB_PORT || '3306'}
   - Base de datos: ${process.env.DB_NAME || 'data_dream'}
   - Usuario: ${process.env.DB_USER || 'root'}`);
    
    // Sincronizar modelos (crear/actualizar tablas)
    console.log('🔄 Sincronizando modelos de base de datos...');
    await sequelize.sync({ force: true }); // force: true recrea las tablas
    console.log('✅ Tablas creadas/actualizadas correctamente');
    
    // Crear usuario administrador por defecto
    console.log('👤 Creando usuario administrador por defecto...');
    
    const adminUser = await Usuario.create({
      nombre: 'Yamila',
      apellido: 'Sueldo',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@datadream.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
      rol: 'super_admin',
      activo: true
    });
    
    console.log('✅ Usuario administrador creado:', {
      id: adminUser.id,
      email: adminUser.email,
      nombre: adminUser.nombre + ' ' + adminUser.apellido,
      rol: adminUser.rol
    });
    
    // Crear productos de ejemplo
    console.log('📦 Creando catálogo de productos de ejemplo...');
    
    const productosEjemplo = [
      // CATEGORÍA: ROPA
      {
        nombre: 'Remera Básica Data Dream',
        descripcion: 'Remera de algodón 100% con logo bordado de la marca',
        categoria: 'ropa',
        precio: 15000,
        imagen: '/uploads/productos/img1.png',
        stock: 25,
        color: 'Negro',
        talla: 'M',
        material: 'Algodón 100%',
        peso: 180,
        activo: true,
        destacado: false
      },
      {
        nombre: 'Remera Estampada Vintage',
        descripcion: 'Remera con estampado retro exclusivo de edición limitada',
        categoria: 'ropa',
        precio: 18000,
        imagen: '/uploads/productos/img2.png',
        stock: 20,
        color: 'Blanco',
        talla: 'L',
        material: 'Algodón 90% - Elastano 10%',
        peso: 190,
        activo: true,
        destacado: true
      },
      {
        nombre: 'Buzo Canguro Premium',
        descripcion: 'Buzo con capucha y bolsillo frontal de alta calidad',
        categoria: 'ropa',
        precio: 25000,
        imagen: '/uploads/productos/img3.png',
        stock: 15,
        color: 'Gris',
        talla: 'XL',
        material: 'Algodón 80% - Poliéster 20%',
        peso: 420,
        activo: true,
        destacado: false
      },
      {
        nombre: 'Remera Deportiva Tech',
        descripcion: 'Remera técnica de secado rápido para deportes y entrenamientos',
        categoria: 'ropa',
        precio: 20000,
        imagen: '/uploads/productos/img4.png',
        stock: 30,
        color: 'Azul',
        talla: 'S',
        material: 'Poliéster técnico DRI-FIT',
        peso: 160,
        activo: true,
        destacado: true
      },
      {
        nombre: 'Buzo Oversize Trendy',
        descripcion: 'Buzo de corte holgado, perfecto para el estilo urbano actual',
        categoria: 'ropa',
        precio: 28000,
        imagen: '/uploads/productos/img5.png',
        stock: 12,
        color: 'Beige',
        talla: 'XL',
        material: 'Algodón orgánico',
        peso: 450,
        activo: true,
        destacado: false
      },
      {
        nombre: 'Remera Polo Clásica',
        descripcion: 'Polo de corte clásico para ocasiones casuales y formales',
        categoria: 'ropa',
        precio: 22000,
        imagen: '/uploads/productos/img6.png',
        stock: 18,
        color: 'Azul Marino',
        talla: 'M',
        material: 'Algodón Piqué',
        peso: 220,
        activo: true,
        destacado: false
      },
      
      // CATEGORÍA: ACCESORIOS
      {
        nombre: 'Gorra Snapback Clásica',
        descripcion: 'Gorra ajustable con visera plana y logo bordado DATA DREAM',
        categoria: 'accesorios',
        precio: 12000,
        imagen: '/uploads/productos/img-05.jpg',
        stock: 40,
        color: 'Negro',
        material: 'Algodón y Poliéster',
        dimensiones: 'Talle único',
        peso: 85,
        activo: true,
        destacado: true
      },
      {
        nombre: 'Gorra Trucker Vintage',
        descripcion: 'Gorra con malla trasera y diseño retro de los 90s',
        categoria: 'accesorios',
        precio: 14000,
        imagen: '/uploads/productos/img-06.jpg',
        stock: 35,
        color: 'Blanco',
        material: 'Algodón frontal y malla trasera',
        dimensiones: 'Ajustable',
        peso: 95,
        activo: false, 
        destacado: false
      },
      {
        nombre: 'Gorra Dad Hat Casual',
        descripcion: 'Gorra de perfil bajo para uso diario y casual',
        categoria: 'accesorios',
        precio: 13000,
        imagen: '/uploads/productos/img-07.jpg',
        stock: 25,
        color: 'Verde Oliva',
        material: 'Algodón 100%',
        dimensiones: 'Regulable',
        peso: 80,
        activo: true,
        destacado: true
      },
      {
        nombre: 'Billetera Cuero Premium',
        descripcion: 'Billetera de cuero genuino con múltiples compartimentos y protección RFID',
        categoria: 'accesorios',
        precio: 22000,
        imagen: '/uploads/productos/img-08.jpg',
        stock: 18,
        color: 'Marrón',
        material: 'Cuero genuino',
        dimensiones: '11cm x 8cm x 2cm',
        peso: 120,
        activo: true,
        destacado: false
      },
      {
        nombre: 'Billetera Minimalista Pro',
        descripcion: 'Billetera compacta de diseño minimalista con tecnología anti-clonación',
        categoria: 'accesorios',
        precio: 18000,
        imagen: '/uploads/productos/img-09.jpg',
        stock: 22,
        color: 'Negro',
        material: 'Cuero sintético premium',
        dimensiones: '10cm x 7cm x 1cm',
        peso: 85,
        activo: true,
        destacado: false
      },
      {
        nombre: 'Mochila Urbana Data Dream',
        descripcion: 'Mochila resistente con compartimento para laptop y múltiples bolsillos',
        categoria: 'accesorios',
        precio: 35000,
        imagen: '/uploads/productos/img-10.jpg',
        stock: 15,
        color: 'Negro',
        material: 'Poliéster resistente al agua',
        dimensiones: '45cm x 30cm x 15cm',
        peso: 680,
        activo: true,
        destacado: true
      },
      {
        nombre: 'Billetera',
        descripcion: 'Lentes de sol con diseño vintage y protección UV 400',
        categoria: 'accesorios',
        precio: 16000,
        imagen: '/uploads/productos/img-11.jpg',
        stock: 28,
        color: 'Negro',
        material: 'Acetato y cristal polarizado',
        dimensiones: 'Talle único',
        peso: 35,
        activo: true,
        destacado: false
      }
    ];
    
    const productosCreados = await Producto.bulkCreate(productosEjemplo);
    console.log(`✅ ${productosCreados.length} productos de ejemplo creados correctamente`);
    
  
    
    console.log(`
🔑 Credenciales de administrador:
   📧 Email: ${adminUser.email}
   🔒 Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}
   👤 Rol: ${adminUser.rol}

🌐 URLs del sistema:
   🏠 Aplicación: http://localhost:5173/
   🔐 Login Admin: http://localhost:3000/admin/login
   📊 Dashboard: http://localhost:3000/admin/dashboard
   🔌 API Base: http://localhost:3000/api/productos
   📈 Estadísticas API: http://localhost:3000/api/productos/categorias/estadisticas

🚀 Comandos para iniciar:
   Backend:  cd backend && npm run dev
   Frontend: cd frontend && npm run dev

📅 Proyecto: Trabajo Práctico Integrador 2025
    `);
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    
    // Diagnósticos específicos
    if (error.name === 'SequelizeConnectionError') {
      console.error(`PROBLEMA DE CONEXIÓN A LA BASE DE DATOS `);
    } else if (error.name === 'SequelizeValidationError') {
      console.error('❌ Error de validación en los datos:', error.errors);
    } else {
      console.error('❌ Error inesperado:', error.message);
    }
    
    console.error('\n📋 Stack completo para debugging:', error.stack);
  } finally {
    console.log('\n🔚 Finalizando script de configuración...');
    process.exit(0);
  }
};

// Función para crear directorios necesarios
async function crearDirectorios() {
  const directorios = [
    'uploads',
    'uploads/productos',
    'vista/admin',
    'estaticos/css',
    'estaticos/js',
    'estaticos/img'
  ];

  console.log('📁 Verificando/creando directorios necesarios...');
  
  for (const dir of directorios) {
    const rutaCompleta = path.join(__dirname, dir);
    if (!fs.existsSync(rutaCompleta)) {
      fs.mkdirSync(rutaCompleta, { recursive: true });
      console.log(`  ✅ Creado: ${dir}`);
    } else {
      console.log(`  ✅ Existe: ${dir}`);
    }
  }
}

// Función para crear archivo .env por defecto
async function crearArchivoEnv() {
  const envContent = `# Configuración de Base de Datos - DATA DREAM
DB_HOST=localhost
DB_PORT=3306
DB_NAME=data_dream
DB_USER=root
DB_PASSWORD=
DB_DIALECT=mysql

# Configuración JWT
JWT_SECRET=clave_super_secreta_pero_enserio_yamila_sueldo_2025

# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Usuario Administrador por Defecto
DEFAULT_ADMIN_EMAIL=admin@datadream.com
DEFAULT_ADMIN_PASSWORD=admin123

# URL del Frontend (para CORS)
FRONTEND_URL=http://localhost:5173

# Configuración de Archivos
MAX_FILE_SIZE=5242880

# Información del Proyecto
PROJECT_NAME=DATA DREAM
PROJECT_AUTHOR=Yamila Sueldo
PROJECT_YEAR=2025
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ Archivo .env creado con configuración por defecto');
  console.log('⚠️  Recuerda ajustar las credenciales de base de datos si es necesario');
}

// Función para obtener estadísticas
async function obtenerEstadisticas() {
  const usuarios = await Usuario.count();
  const productosTotal = await Producto.count();
  const productosActivos = await Producto.count({ where: { activo: true } });
  const productosInactivos = productosTotal - productosActivos;
  const ropa = await Producto.count({ where: { categoria: 'ropa', activo: true } });
  const accesorios = await Producto.count({ where: { categoria: 'accesorios', activo: true } });
  const destacados = await Producto.count({ where: { destacado: true, activo: true } });

  return {
    usuarios,
    productosTotal,
    productosActivos,
    productosInactivos,
    ropa,
    accesorios,
    destacados
  };
}

// Ejecutar setup si se llama directamente
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;