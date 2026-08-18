import { Currency } from '../models';

export const initialCurrencies = [
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', rateToUsd: 1.0, lastUpdated: new Date() },
  { code: 'EUR', name: 'Euro', symbol: '€', rateToUsd: 0.92, lastUpdated: new Date() },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$', rateToUsd: 17.50, lastUpdated: new Date() },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£', rateToUsd: 0.79, lastUpdated: new Date() },
  { code: 'CAD', name: 'Dólar Canadiense', symbol: '$', rateToUsd: 1.36, lastUpdated: new Date() },
  { code: 'JPY', name: 'Yen Japonés', symbol: '¥', rateToUsd: 155.00, lastUpdated: new Date() },
];

export async function seedCurrencies(): Promise<void> {
  console.log('🌱 [Seeder]: Sembrando divisas base...');
  for (const curr of initialCurrencies) {
    await Currency.upsert(curr);
  }
  console.log('✅ [Seeder]: Divisas sembradas correctamente.');
}
