import { DataTypes, Model, Optional } from 'sequelize'

import {sequelize} from '../services/database.js'

interface ICategory {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryCreationAttributes = Optional<ICategory, 'id'>

export class Account extends Model<ICategory, CategoryCreationAttributes> {
  declare id: number;
  declare name: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Account.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: 'accounts',
    modelName: 'account',
  }
)