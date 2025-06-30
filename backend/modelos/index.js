const { sequelize } = require('../config/database');
const Usuario = require('./usuario');
const Producto = require('./producto');
const { Venta, ItemVenta } = require('./venta');

// Definir asociaciones

// Venta - ItemVenta (Uno a muchos)
Venta.hasMany(ItemVenta, {
  foreignKey: 'ventaId',
  as: 'items'
});
ItemVenta.belongsTo(Venta, {
  foreignKey: 'ventaId',
  as: 'venta'
});

// Producto - ItemVenta (Uno a muchos)
Producto.hasMany(ItemVenta, {
  foreignKey: 'productoId',
  as: 'itemsVenta'
});
ItemVenta.belongsTo(Producto, {
  foreignKey: 'productoId',
  as: 'producto'
});

// Venta - Producto (Muchos a muchos a través de ItemVenta)
Venta.belongsToMany(Producto, {
  through: ItemVenta,
  foreignKey: 'ventaId',
  otherKey: 'productoId',
  as: 'productos'
});
Producto.belongsToMany(Venta, {
  through: ItemVenta,
  foreignKey: 'productoId',
  otherKey: 'ventaId',
  as: 'ventas'
});

// Exportar todos los modelos y la conexión
module.exports = {
  sequelize,
  Usuario,
  Producto,
  Venta,
  ItemVenta
};