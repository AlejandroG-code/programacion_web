import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import { sequelize } from '../../config/database';
import { User } from './user.model';
import { Category } from './category.model';
import { Currency } from './currency.model';

export class Budget extends Model<InferAttributes<Budget>, InferCreationAttributes<Budget>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare categoryId: string;
  declare monthlyLimit: number;
  declare currencyCode: string;
  declare periodMonth: number;
  declare periodYear: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;

  // Relaciones
  declare user?: NonAttribute<User>;
  declare category?: NonAttribute<Category>;
  declare currency?: NonAttribute<Currency>;
}

Budget.init(
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
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    monthlyLimit: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    currencyCode: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
      references: {
        model: 'currencies',
        key: 'code',
      },
    },
    periodMonth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    periodYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2000,
        max: 2100,
      },
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
    tableName: 'budgets',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_budgets_user_cat_period',
        unique: true,
        fields: ['user_id', 'category_id', 'period_month', 'period_year'],
        where: {
          deleted_at: null,
        },
      },
    ],
  }
);
