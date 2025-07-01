const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'data_dream',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a BD establecida');
    return true;
  } catch (error) {
    console.log('BD no disponible');
    return false;
  }
};

const closeDB = async () => {
  try {
    await sequelize.close();
    console.log('✅ Conexión cerrada');
  } catch (error) {
    console.error('Error cerrando conexión:', error);
  }
};

module.exports = {
  sequelize,
  connectDB,
  closeDB
};