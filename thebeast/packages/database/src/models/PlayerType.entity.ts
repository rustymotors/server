import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IPlayerType {
    playerTypeId: number; // int
    playerType: string; // varchar(100)
}

export type PlayerTypeCreationAttributes = Optional<IPlayerType, "playerTypeId">;

export class PlayerType extends Model<IPlayerType, PlayerTypeCreationAttributes> {
    declare playerTypeId: number;
    declare playerType: string;
}


PlayerType.init(
    {
        playerTypeId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        playerType: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: "player_types",
        timestamps: false
    }
);
