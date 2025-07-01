const { sequelize, Usuario, Producto } = require('../modelos');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log(' Iniciando seeding de la base de datos');
    // Conectar a la base de datos
    await sequelize.sync({ force: true });
    console.log('✅ Tablas creadas correctamente');

    // Crear usuario administrador por defecto
    const adminUser = await Usuario.create({
      nombre: 'Admin',
      apellido: 'Sistema',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@datadream.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
      rol: 'super_admin'
    });
    console.log('✅ Usuario administrador creado:', adminUser.email);

    // Productos de ejemplo - Categoría ROPA
    const ropas = [
      {
        nombre: 'Remera Básica Blanca',
        descripcion: 'Remera de algodón 100% de corte clásico',
        categoria: 'ropa',
        precio: 15000,
        imagen: '/img/img1.png',
        stock: 25,
        color: 'Blanco',
        talla: 'M',
        material: 'Algodón 100%'
      },
      {
        nombre: 'Remera Estampada',
        descripcion: 'Remera con estampado exclusivo de la marca',
        categoria: 'ropa',
        precio: 18000,
        imagen: '/img/img2.png',
        stock: 20,
        color: 'Negro',
        talla: 'L',
        material: 'Algodón 90% - Elastano 10%'
      },
      {
        nombre: 'Buzo Canguro',
        descripcion: 'Buzo con capucha y bolsillo frontal',
        categoria: 'ropa',
        precio: 25000,
        imagen: '/img/img3.png',
        stock: 15,
        color: 'Gris',
        talla: 'XL',
        material: 'Algodón 80% - Poliéster 20%'
      },
      {
        nombre: 'Remera Deportiva',
        descripcion: 'Remera técnica para entrenamiento',
        categoria: 'ropa',
        precio: 20000,
        imagen: '/img/img4.png',
        stock: 30,
        destacado: true,
        color: 'Azul',
        talla: 'S',
        material: 'Poliéster técnico'
      },
      {
        nombre: 'Buzo Oversize',
        descripcion: 'Buzo de corte holgado, tendencia actual',
        categoria: 'ropa',
        precio: 28000,
        imagen: '/img/img5.png',
        stock: 12,
        color: 'Beige',
        talla: 'XL',
        material: 'Algodón orgánico'
      }
    ];

    // Productos de ejemplo - Categoría ACCESORIOS
    const accesorios = [
      {
        nombre: 'Gorra Snapback',
        descripcion: 'Gorra ajustable con visera plana',
        categoria: 'accesorios',
        precio: 12000,
        imagen: '/img/img-05.jpg',
        stock: 40,
        color: 'Negro',
        material: 'Algodón y Poliéster'
      },
      {
        nombre: 'Gorra Trucker',
        descripcion: 'Gorra con malla trasera y diseño vintage',
        categoria: 'accesorios',
        precio: 14000,
        imagen: '/img/img-06.jpg',
        stock: 35,
        activo: false, // Para probar baja lógica
        color: 'Blanco',
        material: 'Algodón y malla'
      },
      {
        nombre: 'Gorra Dad Hat',
        descripcion: 'Gorra de perfil bajo, estilo casual',
        categoria: 'accesorios',
        precio: 13000,
        imagen: '/img/img-07.jpg',
        stock: 25,
        destacado: true,
        color: 'Verde',
        material: 'Algodón 100%'
      },
      {
        nombre: 'Billetera Cuero',
        descripcion: 'Billetera de cuero genuino con múltiples compartimentos',
        categoria: 'accesorios',
        precio: 22000,
        imagen: '/img/img-08.jpg',
        stock: 18,
        color: 'Marrón',
        material: 'Cuero genuino',
        dimensiones: '11cm x 8cm x 2cm'
      },
      {
        nombre: 'Billetera Minimalista',
        descripcion: 'Billetera compacta de diseño minimalista',
        categoria: 'accesorios',
        precio: 18000,
        imagen: '/img/img-09.jpg',
        stock: 22,
        color: 'Negro',
        material: 'Cuero sintético',
        dimensiones: '10cm x 7cm x 1cm'
      }
    ];

    // Insertar productos de ropa
    await Producto.bulkCreate(ropas);
    console.log('✅ Productos de ropa creados');

    // Insertar accesorios
    await Producto.bulkCreate(accesorios);
    console.log('✅ Accesorios creados');

    const totalProducts = await Producto.count();
    const activeProducts = await Producto.count({ where: { activo: true } });
    
    console.log(`
   Credenciales de admin:
   Email: ${adminUser.email}
   Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}
    `);

  } catch (error) {
    console.error(' Error', error);
    console.error('Stack completo:', error.stack);
  } finally {
    process.exit(0);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;