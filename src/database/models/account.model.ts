import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import { sequelize } from '../../config/database';
import { User } from './user.model';
import { Currency } from './currency.model';

export enum AccountType {
  CASH = 'CASH',
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  SAVINGS = 'SAVINGS',
  INVESTMENT = 'INVESTMENT',
}

export class Account extends Model<InferAttributes<Account>, InferCreationAttributes<Account>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare name: string;
  declare type: AccountType;
  declare currencyCode: string;
  declare currentBalance: number;
  declare initialBalance: CreationOptional<number>;
  declare color: CreationOptional<string>;
  declare icon: CreationOptional<string>;
  declare isIncludedInNetWorth: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;

  // Relaciones
  declare user?: NonAttribute<User>;
  declare currency?: NonAttribute<Currency>;
}

Account.init(
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(AccountType)),
      allowNull: false,
      defaultValue: AccountType.DEBIT,
    },
    currencyCode: {
      type: DataTypes.STRING(3),
      allowNull: false,
      references: {
        model: 'currencies',
        key: 'code',
      },
    },
    currentBalance: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    initialBalance: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    color: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: '#3B82F6', // Blue por defecto
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'wallet',
    },
    isIncludedInNetWorth: {
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
    tableName: 'accounts',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_accounts_user_id',
        fields: ['user_id'],
      },
    ],
  }
);
