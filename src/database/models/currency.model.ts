import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../../config/database';

export class Currency extends Model<InferAttributes<Currency>, InferCreationAttributes<Currency>> {
  declare code: string; // ISO 4217 (USD, EUR, MXN)
  declare name: string;
  declare symbol: string;
  declare rateToUsd: number;
  declare lastUpdated: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Currency.init(
  {
    code: {
      type: DataTypes.STRING(3),
      primaryKey: true,
      allowNull: false,
      validate: {
        len: [3, 3],
        isUppercase: true,
      },
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    symbol: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    rateToUsd: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 1.0,
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'currencies',
    timestamps: true,
    paranoid: false, // Divisas no requieren soft delete
    underscored: true,
  }
);
