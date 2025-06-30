// setup.js - Script para configuración automática
const { sequelize, Usuario, Producto } = require('./modelos');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    console.log('🚀 Iniciando configuración automática...');
    
    // Verificar conexión
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');
    
    // Mostrar información de conexión
    console.log(`📊 Información de conexión:
   - Tipo: ${process.env.DB_TYPE || 'sqlite'}
   - Host: ${process.env.DB_HOST || 'localhost'}
   - Base de datos: ${process.env.DB_NAME || 'database.sqlite'}
   - Usuario: ${process.env.DB_USER || 'N/A'}`);
    
    // Sincronizar modelos (crear tablas)
    console.log('🔄 Sincronizando modelos...');
    await sequelize.sync({ force: true }); // force: true recrea las tablas
    console.log('✅ Tablas creadas/actualizadas correctamente');
    
    // Crear usuario administrador por defecto
    console.log('👤 Creando usuario administrador por defecto...');
    
    const adminUser = await Usuario.create({
      nombre: 'Admin',
      apellido: 'Sistema',
      email: 'admin@datadream.com',
      password: 'admin123',
      rol: 'super_admin',
      activo: true
    });
    
    console.log('✅ Usuario administrador creado:', {
      id: adminUser.id,
      email: adminUser.email,
      nombre: adminUser.nombre + ' ' + adminUser.apellido
    });
    
    // Crear productos de ejemplo
    console.log('📦 Creando productos de ejemplo...');
    
    const productosEjemplo = [
      {
        nombre: 'Remera Básica Negra',
        descripcion: 'Remera de algodón 100% de corte clásico',
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
        nombre: 'Remera Estampada Vintage',
        descripcion: 'Remera con estampado retro exclusivo',
        categoria: 'ropa',
        precio: 18000,
        imagen: '/img/img2.png',
        stock: 20,
        color: 'Blanco',
        talla: 'L',
        material: 'Algodón 90% - Elastano 10%',
        activo: true
      },
      {
        nombre: 'Buzo Canguro Premium',
        descripcion: 'Buzo con capucha y bolsillo frontal de alta calidad',
        categoria: 'ropa',
        precio: 25000,
        imagen: '/img/img3.png',
        stock: 15,
        color: 'Gris',
        talla: 'XL',
        material: 'Algodón 80% - Poliéster 20%',
        activo: true
      },
      {
        nombre: 'Remera Deportiva Tech',
        descripcion: 'Remera técnica de secado rápido para deportes',
        categoria: 'ropa',
        precio: 20000,
        imagen: '/img/img4.png',
        stock: 30,
        destacado: true,
        color: 'Azul',
        talla: 'S',
        material: 'Poliéster técnico',
        activo: true
      },
      {
        nombre: 'Buzo Oversize Trendy',
        descripcion: 'Buzo de corte holgado, perfecto para el estilo actual',
        categoria: 'ropa',
        precio: 28000,
        imagen: '/img/img5.png',
        stock: 12,
        color: 'Beige',
        talla: 'XL',
        material: 'Algodón orgánico',
        activo: true
      },
      {
        nombre: 'Gorra Snapback Clásica',
        descripcion: 'Gorra ajustable con visera plana y logo bordado',
        categoria: 'accesorios',
        precio: 12000,
        imagen: '/img/img-05.jpg',
        stock: 40,
        color: 'Negro',
        material: 'Algodón y Poliéster',
        activo: true
      },
      {
        nombre: 'Gorra Trucker Vintage',
        descripcion: 'Gorra con malla trasera y diseño retro',
        categoria: 'accesorios',
        precio: 14000,
        imagen: '/img/img-06.jpg',
        stock: 35,
        color: 'Blanco',
        material: 'Algodón y malla',
        activo: false // Para probar funcionalidad de activar/desactivar
      },
      {
        nombre: 'Gorra Dad Hat Casual',
        descripcion: 'Gorra de perfil bajo para uso diario',
        categoria: 'accesorios',
        precio: 13000,
        imagen: '/img/img-07.jpg',
        stock: 25,
        destacado: true,
        color: 'Verde',
        material: 'Algodón 100%',
        activo: true
      },
      {
        nombre: 'Billetera Cuero Premium',
        descripcion: 'Billetera de cuero genuino con múltiples compartimentos',
        categoria: 'accesorios',
        precio: 22000,
        imagen: '/img/img-08.jpg',
        stock: 18,
        color: 'Marrón',
        material: 'Cuero genuino',
        dimensiones: '11cm x 8cm x 2cm',
        activo: true
      },
      {
        nombre: 'Billetera Minimalista Pro',
        descripcion: 'Billetera compacta de diseño minimalista moderno',
        categoria: 'accesorios',
        precio: 18000,
        imagen: '/img/img-09.jpg',
        stock: 22,
        color: 'Negro',
        material: 'Cuero sintético',
        dimensiones: '10cm x 7cm x 1cm',
        activo: true
      }
    ];
    
    await Producto.bulkCreate(productosEjemplo);
    console.log('✅ Productos de ejemplo creados');
    
    // Verificar creación
    const totalUsuarios = await Usuario.count();
    const totalProductos = await Producto.count();
    const productosActivos = await Producto.count({ where: { activo: true } });
    
    console.log(`
🎉 ¡Configuración completada exitosamente!

📊 Resumen:
   - Usuarios creados: ${totalUsuarios}
   - Productos totales: ${totalProductos}
   - Productos activos: ${productosActivos}
   - Productos inactivos: ${totalProductos - productosActivos}

🔑 Credenciales de administrador:
   Email: admin@datadream.com
   Password: admin123

🌐 URLs para probar:
   - Login Admin: http://localhost:3000/admin/login
   - Dashboard: http://localhost:3000/admin/dashboard
   - Diagnóstico: http://localhost:3000/admin/diagnostico
   - API Productos: http://localhost:3000/api/productos

🚀 Para iniciar el servidor: npm run dev
    `);
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    
    if (error.name === 'SequelizeConnectionError') {
      console.error(`
🔧 Problema de conexión a la base de datos:

Si usas MySQL/XAMPP:
1. Asegúrate de que XAMPP esté ejecutándose
2. Crea la base de datos 'data_dream_db' en phpMyAdmin
3. Verifica las credenciales en el archivo .env

Si usas SQLite:
1. Cambia DB_TYPE=sqlite en tu .env
2. No necesitas XAMPP para SQLite

Configuración actual:
- DB_TYPE: ${process.env.DB_TYPE}
- DB_HOST: ${process.env.DB_HOST}
- DB_NAME: ${process.env.DB_NAME}
      `);
    }
    
    console.error('Stack completo:', error.stack);
  } finally {
    process.exit(0);
  }
};

// Ejecutar setup si se llama directamente
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;