import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IGameUser {
    id: number;
    username: string;
    password: string;
    customerId: number;
    createdAt: Date;
    updatedAt: Date;
}

export type GameUserCreationAttributes = Optional<IGameUser, "id">;

export class GameUser extends Model<IGameUser, GameUserCreationAttributes> {
    declare id: number;
    declare username: string;
    declare password: string;
    declare customerId: number;
    declare createdAt: Date;
    declare updatedAt: Date;
}

GameUser.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        password: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
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
        tableName: "gameUsers",
        modelName: "gameUser",
    },
);
