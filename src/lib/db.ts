import { sequelize } from '../config/database';
import { Currency, Category } from '../database/models';
import { initialCurrencies } from '../database/seeders/01-currencies.seeder';
import { defaultCategories } from '../database/seeders/02-default-categories.seeder';

let isInitialized = false;

export async function ensureDatabaseReady(): Promise<void> {
  if (isInitialized) return;

  try {
    // Inicializar extensiones y sincronizar tablas si no existen
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').catch(() => {});
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";').catch(() => {});
    await sequelize.sync();

    // Sembrar divisas si está vacío
    const countCurrencies = await Currency.count();
    if (countCurrencies === 0) {
      for (const curr of initialCurrencies) {
        await Currency.upsert(curr);
      }
    }

    // Sembrar categorías si está vacío
    const countCategories = await Category.count({ where: { isSystemDefault: true } });
    if (countCategories === 0) {
      for (const cat of defaultCategories) {
        await Category.findOrCreate({
          where: { name: cat.name, type: cat.type, isSystemDefault: true, userId: null },
          defaults: { ...cat, userId: null },
        });
      }
    }

    isInitialized = true;
  } catch (error) {
    console.error('⚠️ [DB Warning]: Error asegurando esquema de base de datos:', error);
  }
}
