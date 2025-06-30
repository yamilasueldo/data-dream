const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoria: {
    type: DataTypes.ENUM('ropa', 'accesorios'),
    allowNull: false,
    validate: {
      isIn: [['ropa', 'accesorios']]
    }
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true
    }
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '/img/default-product.png'
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      isInt: true
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  destacado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Metadatos adicionales
  peso: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    comment: 'Peso en gramos'
  },
  dimensiones: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Dimensiones del producto'
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  talla: {
    type: DataTypes.STRING,
    allowNull: true
  },
  material: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'productos',
  indexes: [
    {
      fields: ['categoria']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['precio']
    }
  ]
});

// Método para formatear precio
Producto.prototype.obtenerPrecioFormateado = function() {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(this.precio);
};

// Scope para productos activos
Producto.addScope('activos', {
  where: {
    activo: true
  }
});

// Scope para productos por categoría
Producto.addScope('porCategoria', (categoria) => ({
  where: {
    categoria: categoria,
    activo: true
  }
}));

// Método para verificar si tiene stock
Producto.prototype.tieneStock = function(cantidad = 1) {
  return this.stock >= cantidad;
};

// Método para reducir stock
Producto.prototype.reducirStock = async function(cantidad = 1) {
  if (!this.tieneStock(cantidad)) {
    throw new Error(`Stock insuficiente. Disponible: ${this.stock}, Solicitado: ${cantidad}`);
  }
  
  this.stock -= cantidad;
  await this.save();
  return this;
};

module.exports = Producto;