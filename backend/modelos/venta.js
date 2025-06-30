const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Venta = sequelize.define('Venta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numeroVenta: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  nombreCliente: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  },
  emailCliente: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true
    }
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'procesando', 'completada', 'cancelada'),
    defaultValue: 'completada'
  },
  fechaVenta: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  // Metadatos de la venta
  metodoPago: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia'),
    defaultValue: 'efectivo'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'ventas',
  hooks: {
    beforeCreate: async (venta) => {
      if (!venta.numeroVenta) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        venta.numeroVenta = `VTA-${timestamp}-${random}`;
      }
    }
  },
  indexes: [
    {
      fields: ['fechaVenta']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['numeroVenta']
    }
  ]
});

// Tabla intermedia para la relación muchos a muchos entre Ventas y Productos
const ItemVenta = sequelize.define('ItemVenta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      isInt: true
    }
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Precio del producto al momento de la venta'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'cantidad * precio'
  }
}, {
  tableName: 'items_venta',
  hooks: {
    beforeSave: (itemVenta) => {
      itemVenta.subtotal = itemVenta.cantidad * itemVenta.precio;
    }
  }
});

// Método para formatear el total
Venta.prototype.obtenerTotalFormateado = function() {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(this.total);
};

// Método para obtener fecha formateada
Venta.prototype.obtenerFechaFormateada = function() {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(this.fechaVenta);
};

// Método para calcular total de items
Venta.prototype.calcularTotal = async function() {
  const items = await this.getItems();
  const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  this.total = total;
  await this.save();
  return this;
};

module.exports = { Venta, ItemVenta };