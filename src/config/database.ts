import { Sequelize, Options } from 'sequelize';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const dbOptions: Options = {
  dialect: 'postgres',
  dialectModule: pg,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'personal_finances_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  pool: {
    max: isProduction ? 20 : 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true, // Soft delete por defecto
    freezeTableName: true,
  },
};

export const sequelize = new Sequelize(dbOptions);

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    console.log('✅ [Database]: Conexión exitosa a PostgreSQL');
    return true;
  } catch (error) {
    console.error('❌ [Database]: Error de conexión a PostgreSQL:', error);
    return false;
  }
}
