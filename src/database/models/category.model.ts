import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import { sequelize } from '../../config/database';
import { User } from './user.model';

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export class Category extends Model<InferAttributes<Category>, InferCreationAttributes<Category>> {
  declare id: CreationOptional<string>;
  declare userId: string | null;
  declare name: string;
  declare type: CategoryType;
  declare icon: CreationOptional<string>;
  declare color: CreationOptional<string>;
  declare isSystemDefault: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;

  // Relaciones
  declare user?: NonAttribute<User>;
}

Category.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true, // Null para categorías base del sistema
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
      type: DataTypes.ENUM(...Object.values(CategoryType)),
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'tag',
    },
    color: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: '#10B981', // Emerald
    },
    isSystemDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'categories',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_categories_user_type',
        fields: ['user_id', 'type'],
      },
    ],
  }
);
