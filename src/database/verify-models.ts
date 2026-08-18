import {
  Currency,
  User,
  Account,
  Category,
  Transaction,
  RecurringTransaction,
  Budget,
  AccountType,
  CategoryType,
  TransactionType,
  RecurrenceFrequency,
} from './models';
import { initialCurrencies } from './seeders/01-currencies.seeder';
import { defaultCategories } from './seeders/02-default-categories.seeder';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ Falló la aserción: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

export async function verifyModelDefinitions(): Promise<void> {
  console.log('\n🔍 [Verificación de Modelos y Esquemas Sequelize]');

  // 1. Verificar registro de modelos
  console.log('\n1. Verificando Registro de Modelos:');
  assert(!!User.rawAttributes.id, 'User tiene atributo id (UUID)');
  assert(!!User.rawAttributes.email, 'User tiene atributo email');
  assert(!!User.rawAttributes.baseCurrencyCode, 'User tiene atributo baseCurrencyCode');

  assert(!!Currency.rawAttributes.code, 'Currency tiene clave primaria code (ISO 4217)');
  assert(!!Currency.rawAttributes.rateToUsd, 'Currency tiene atributo rateToUsd (DECIMAL)');

  assert(!!Account.rawAttributes.currentBalance, 'Account tiene atributo currentBalance');
  assert(!!Account.rawAttributes.type, 'Account tiene atributo type');

  assert(!!Category.rawAttributes.isSystemDefault, 'Category tiene flag isSystemDefault');

  assert(!!Transaction.rawAttributes.amountInBaseCurrency, 'Transaction tiene atributo amountInBaseCurrency');
  assert(!!Transaction.rawAttributes.exchangeRateToBase, 'Transaction tiene atributo exchangeRateToBase');

  assert(!!RecurringTransaction.rawAttributes.nextExecutionDate, 'RecurringTransaction tiene nextExecutionDate');
  assert(!!Budget.rawAttributes.monthlyLimit, 'Budget tiene atributo monthlyLimit');

  // 2. Verificar Asociaciones
  console.log('\n2. Verificando Asociaciones entre Modelos:');
  assert(!!User.associations.accounts, 'User tiene asociación accounts');
  assert(!!User.associations.categories, 'User tiene asociación categories');
  assert(!!User.associations.transactions, 'User tiene asociación transactions');
  assert(!!User.associations.budgets, 'User tiene asociación budgets');
  assert(!!Account.associations.user, 'Account pertenece a User');
  assert(!!Transaction.associations.transferPair, 'Transaction tiene autoreferencia transferPair');
  assert(!!Transaction.associations.recurringSource, 'Transaction referencia a RecurringTransaction');
  assert(!!Budget.associations.category, 'Budget referencia a Category');

  // 3. Verificar Datos de Seeders
  console.log('\n3. Verificando Integridad de Seeders:');
  assert(initialCurrencies.length >= 6, `Seeders contienen ${initialCurrencies.length} divisas globales (USD, EUR, MXN, etc.)`);
  assert(defaultCategories.length >= 10, `Seeders contienen ${defaultCategories.length} categorías predeterminadas`);

  const hasUSD = initialCurrencies.some(c => c.code === 'USD' && c.rateToUsd === 1.0);
  assert(hasUSD, 'Divisa base USD configurada con tasa 1.0');

  const incomeCategories = defaultCategories.filter(c => c.type === CategoryType.INCOME);
  const expenseCategories = defaultCategories.filter(c => c.type === CategoryType.EXPENSE);
  assert(incomeCategories.length > 0, `Existen ${incomeCategories.length} categorías de ingreso configuradas`);
  assert(expenseCategories.length > 0, `Existen ${expenseCategories.length} categorías de gasto configuradas`);

  console.log('\n🎉 ¡Todos los modelos, relaciones y seeders han sido validados con éxito!');
}

if (require.main === module || process.argv[1]?.endsWith('verify-models.ts')) {
  verifyModelDefinitions().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
