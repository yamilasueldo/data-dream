const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50],
      notEmpty: true
    }
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  rol: {
    type: DataTypes.ENUM('admin', 'super_admin'),
    defaultValue: 'admin'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    }
  }
});

// Método para comparar contraseñas
Usuario.prototype.compararPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Método para obtener datos sin password
Usuario.prototype.toJSON = function() {
  const usuario = Object.assign({}, this.dataValues);
  delete usuario.password;
  return usuario;
};

module.exports = Usuario;