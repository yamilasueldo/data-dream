// Config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

const dbConfig = {
  dialect: process.env.DB_TYPE || 'sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Configuraciones generales
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  
  // Configuraciones específicas por dialecto
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: false
    // Remover charset y collate que causan warnings en MySQL2
  }
};

// Configurar según el tipo de base de datos
switch (process.env.DB_TYPE) {
  case 'mysql':
    sequelize = new Sequelize(
      process.env.DB_NAME || 'data_dream_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASS || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        ...dbConfig,
        dialectOptions: {
                  supportBigNumbers: true,
          bigNumberStrings: true,
          dateStrings: true,
          typeCast: true
        }
      }
    );
    break;

  case 'postgres':
    sequelize = new Sequelize(
      process.env.DB_NAME || 'data_dream_db',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASS || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        ...dbConfig,
        dialectOptions: {
          ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
          } : false
        }
      }
    );
    break;

  case 'sqlite':
  default:
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: process.env.DB_STORAGE || './database.sqlite',
      ...dbConfig,
      dialectOptions: {
        // Habilitar claves foráneas en SQLite
        foreign_keys: true
      }
    });
    break;
}

const connectDB = async () => {
  try {
    console.log(`🔄 Conectando a base de datos ${process.env.DB_TYPE || 'sqlite'}...`);
    
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar modelos en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Sincronizando modelos de base de datos...');
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados correctamente.');
    }
    
    return sequelize;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    
    // Información de ayuda según el tipo de error
    if (error.name === 'SequelizeConnectionError') {
      console.error(`


${process.env.DB_TYPE === 'mysql' ? `
  🔹 MySQL:
    - Verifica que MySQL esté ejecutándose
    - Confirma las credenciales en el archivo .env
    - Asegúrate de que la base de datos '${process.env.DB_NAME}' exista
    - Comando para crear DB: CREATE DATABASE ${process.env.DB_NAME};
` : ''}
${process.env.DB_TYPE === 'postgres' ? `
  🔹 PostgreSQL:
    - Verifica que PostgreSQL esté ejecutándose
    - Confirma las credenciales en el archivo .env
    - Asegúrate de que la base de datos '${process.env.DB_NAME}' exista
    - Comando para crear DB: CREATE DATABASE ${process.env.DB_NAME};
` : ''}
${process.env.DB_TYPE === 'sqlite' || !process.env.DB_TYPE ? `
  🔹 SQLite:
    - Verifica permisos de escritura en el directorio
    - La base de datos se creará automáticamente si no existe
` : ''}
      `);
    }
    
    throw error;
  }
};

// Función para cerrar la conexión
const closeDB = async () => {
  try {
    await sequelize.close();
    console.log('✅ Conexión a la base de datos cerrada correctamente.');
  } catch (error) {
    console.error('❌ Error al cerrar la conexión:', error);
  }
};

// Función para verificar el estado de la conexión
const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    return false;
  }
};

// Función para obtener información de la base de datos
const getDatabaseInfo = async () => {
  try {
    const dialect = sequelize.getDialect();
    const version = await sequelize.databaseVersion();
    
    return {
      dialect,
      version,
      database: sequelize.getDatabaseName(),
      host: sequelize.config.host,
      port: sequelize.config.port
    };
  } catch (error) {
    console.error('Error al obtener información de la base de datos:', error);
    return null;
  }
};

module.exports = {
  sequelize,
  connectDB,
  closeDB,
  checkConnection,
  getDatabaseInfo
};