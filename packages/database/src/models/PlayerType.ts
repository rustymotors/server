import { DataTypes, Model } from "sequelize";
import { getDatabase } from "../services/database.js";

export class PlayerType extends Model {}

PlayerType.init(
    {
        playerTypeId: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        playerType: {
            type: DataTypes.STRING,
            validate: {
                len: [1, 50],
            },
            allowNull: false,
        },
    },
    {
        sequelize: getDatabase(),
        modelName: "PlayerType",
        tableName: "player_types",
        timestamps: false,
        indexes: [
            {
                fields: ["playerTypeId"],
                unique: true,
            },
        ],
    },
);
