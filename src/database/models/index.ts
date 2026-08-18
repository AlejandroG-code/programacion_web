import { sequelize } from '../../config/database';
import { Currency } from './currency.model';
import { User } from './user.model';
import { Account, AccountType } from './account.model';
import { Category, CategoryType } from './category.model';
import { RecurringTransaction, RecurrenceFrequency } from './recurring-transaction.model';
import { Transaction, TransactionType, TransactionStatus } from './transaction.model';
import { Budget } from './budget.model';

// ==========================================
// DEFINICIÓN DE ASOCIACIONES (RELACIONES)
// ==========================================

// User <-> Currency
Currency.hasMany(User, { foreignKey: 'baseCurrencyCode', sourceKey: 'code', as: 'users' });
User.belongsTo(Currency, { foreignKey: 'baseCurrencyCode', targetKey: 'code', as: 'baseCurrency' });

// User <-> Account
User.hasMany(Account, { foreignKey: 'userId', as: 'accounts', onDelete: 'CASCADE' });
Account.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Account <-> Currency
Currency.hasMany(Account, { foreignKey: 'currencyCode', sourceKey: 'code', as: 'accounts' });
Account.belongsTo(Currency, { foreignKey: 'currencyCode', targetKey: 'code', as: 'currency' });

// User <-> Category
User.hasMany(Category, { foreignKey: 'userId', as: 'categories', onDelete: 'CASCADE' });
Category.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Transaction
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Account <-> Transaction
Account.hasMany(Transaction, { foreignKey: 'accountId', as: 'transactions', onDelete: 'RESTRICT' });
Transaction.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

// Category <-> Transaction
Category.hasMany(Transaction, { foreignKey: 'categoryId', as: 'transactions', onDelete: 'SET NULL' });
Transaction.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Transaction Self-Reference (Transferencias) & Recurrencia
Transaction.belongsTo(Transaction, { foreignKey: 'transferTransactionId', as: 'transferPair', onDelete: 'SET NULL' });
Transaction.belongsTo(RecurringTransaction, { foreignKey: 'recurringTransactionId', as: 'recurringSource', onDelete: 'SET NULL' });

// User <-> RecurringTransaction
User.hasMany(RecurringTransaction, { foreignKey: 'userId', as: 'recurringTransactions', onDelete: 'CASCADE' });
RecurringTransaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Account <-> RecurringTransaction
Account.hasMany(RecurringTransaction, { foreignKey: 'accountId', as: 'recurringTransactions', onDelete: 'CASCADE' });
RecurringTransaction.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

// Category <-> RecurringTransaction
Category.hasMany(RecurringTransaction, { foreignKey: 'categoryId', as: 'recurringTransactions', onDelete: 'CASCADE' });
RecurringTransaction.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// User <-> Budget
User.hasMany(Budget, { foreignKey: 'userId', as: 'budgets', onDelete: 'CASCADE' });
Budget.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Category <-> Budget
Category.hasMany(Budget, { foreignKey: 'categoryId', as: 'budgets', onDelete: 'CASCADE' });
Budget.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

export {
  sequelize,
  Currency,
  User,
  Account,
  AccountType,
  Category,
  CategoryType,
  RecurringTransaction,
  RecurrenceFrequency,
  Transaction,
  TransactionType,
  TransactionStatus,
  Budget,
};
