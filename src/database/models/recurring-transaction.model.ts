import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import { sequelize } from '../../config/database';
import { User } from './user.model';
import { Account } from './account.model';
import { Category } from './category.model';
import { Currency } from './currency.model';

export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class RecurringTransaction extends Model<
  InferAttributes<RecurringTransaction>,
  InferCreationAttributes<RecurringTransaction>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare accountId: string;
  declare categoryId: string;
  declare amount: number;
  declare type: 'INCOME' | 'EXPENSE';
  declare currencyCode: string;
  declare frequency: RecurrenceFrequency;
  declare intervalCount: CreationOptional<number>;
  declare startDate: string;
  declare endDate: CreationOptional<string | null>;
  declare nextExecutionDate: string;
  declare lastExecutionDate: CreationOptional<string | null>;
  declare description: string;
  declare isActive: CreationOptional<boolean>;
  declare autoConfirm: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;

  // Relaciones
  declare user?: NonAttribute<User>;
  declare account?: NonAttribute<Account>;
  declare category?: NonAttribute<Category>;
  declare currency?: NonAttribute<Currency>;
}

RecurringTransaction.init(
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
      allowNull: false,
      references: {
        model: 'categories',
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
      type: DataTypes.ENUM('INCOME', 'EXPENSE'),
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
    frequency: {
      type: DataTypes.ENUM(...Object.values(RecurrenceFrequency)),
      allowNull: false,
      defaultValue: RecurrenceFrequency.MONTHLY,
    },
    intervalCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nextExecutionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    lastExecutionDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    autoConfirm: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'recurring_transactions',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_recurring_user_id',
        fields: ['user_id'],
      },
      {
        name: 'idx_recurring_next_exec',
        fields: ['next_execution_date', 'is_active'],
      },
    ],
  }
);
