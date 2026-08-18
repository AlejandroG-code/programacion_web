import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import { sequelize } from '../../config/database';
import { User } from './user.model';
import { Account } from './account.model';
import { Category } from './category.model';
import { Currency } from './currency.model';
import { RecurringTransaction } from './recurring-transaction.model';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export enum TransactionStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  RECONCILED = 'RECONCILED',
}

export class Transaction extends Model<InferAttributes<Transaction>, InferCreationAttributes<Transaction>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare accountId: string;
  declare categoryId: string | null;
  declare transferTransactionId: CreationOptional<string | null>;
  declare recurringTransactionId: CreationOptional<string | null>;
  declare amount: number;
  declare type: TransactionType;
  declare currencyCode: string;
  declare exchangeRateToBase: CreationOptional<number>;
  declare amountInBaseCurrency: number;
  declare date: string;
  declare description: string;
  declare notes: CreationOptional<string | null>;
  declare status: CreationOptional<TransactionStatus>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;

  // Relaciones
  declare user?: NonAttribute<User>;
  declare account?: NonAttribute<Account>;
  declare category?: NonAttribute<Category | null>;
  declare currency?: NonAttribute<Currency>;
  declare transferPair?: NonAttribute<Transaction | null>;
  declare recurringSource?: NonAttribute<RecurringTransaction | null>;
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    transferTransactionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'transactions',
        key: 'id',
      },
    },
    recurringTransactionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'recurring_transactions',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(TransactionType)),
      allowNull: false,
    },
    currencyCode: {
      type: DataTypes.STRING(3),
      allowNull: false,
      references: {
        model: 'currencies',
        key: 'code',
      },
    },
    exchangeRateToBase: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 1.0,
    },
    amountInBaseCurrency: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TransactionStatus)),
      allowNull: false,
      defaultValue: TransactionStatus.COMPLETED,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'transactions',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_transactions_user_date',
        fields: ['user_id', 'date'],
      },
      {
        name: 'idx_transactions_user_category',
        fields: ['user_id', 'category_id'],
      },
      {
        name: 'idx_transactions_account',
        fields: ['account_id'],
      },
    ],
  }
);
