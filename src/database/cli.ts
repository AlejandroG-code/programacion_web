import { sequelize, testDatabaseConnection } from '../config/database';
import './models'; // Asegura registro de modelos y asociaciones
import { seedCurrencies } from './seeders/01-currencies.seeder';
import { seedDefaultCategories } from './seeders/02-default-categories.seeder';

async function initExtensions(): Promise<void> {
  console.log('🔧 [DB]: Inicializando extensiones de PostgreSQL (uuid-ossp, pgcrypto)...');
  await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  await sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
}

export async function migrate(): Promise<void> {
  console.log('🚀 [DB Migration]: Ejecutando sincronización de esquema de base de datos...');
  const connected = await testDatabaseConnection();
  if (!connected) {
    throw new Error('No se pudo conectar a la base de datos.');
  }

  await initExtensions();

  // Sincronizar todos los modelos con la base de datos (alter: true para desarrollo)
  await sequelize.sync({ alter: true });
  console.log('✅ [DB Migration]: Esquema de base de datos sincronizado exitosamente.');
}

export async function seed(): Promise<void> {
  console.log('🌱 [DB Seed]: Iniciando proceso de seeders...');
  await testDatabaseConnection();
  await seedCurrencies();
  await seedDefaultCategories();
  console.log('✅ [DB Seed]: Todos los seeders completados con éxito.');
}

export async function reset(): Promise<void> {
  console.log('⚠️ [DB Reset]: Reiniciando base de datos completa...');
  await testDatabaseConnection();
  await initExtensions();
  await sequelize.sync({ force: true });
  console.log('🔄 [DB Reset]: Tablas recreadas desde cero.');
  await seed();
  console.log('✅ [DB Reset]: Base de datos reseteada y sembrada.');
}

// Ejecución por línea de comandos
async function runCLI(): Promise<void> {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'test':
        await testDatabaseConnection();
        break;
      case 'migrate':
        await migrate();
        break;
      case 'seed':
        await seed();
        break;
      case 'reset':
        await reset();
        break;
      default:
        console.log(`
Uso de CLI de Base de Datos:
  npm run db:test     - Prueba la conexión con PostgreSQL
  npm run db:migrate  - Sincroniza y actualiza el esquema
  npm run db:seed     - Ejecuta los seeders de divisas y categorías
  npm run db:reset    - Reinicia la base de datos (DROP + CREATE + SEED)
        `);
        break;
    }
  } catch (error) {
    console.error('❌ [DB CLI Error]:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module || process.argv[1]?.endsWith('cli.ts')) {
  runCLI();
}
