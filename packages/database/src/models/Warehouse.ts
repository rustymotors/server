import { DataTypes, Model as BaseModel, type InferAttributes } from "sequelize";
import { getDatabase } from "../services/database.js";

export class Warehouse extends BaseModel<InferAttributes<Warehouse>> {
    declare brandedPartId: number;
    declare skinId: number;
    declare playerID: number;
    declare qtyAvail: number;
    declare dealOfTheDayBrandedPartId: number | null;
}

Warehouse.init(
    {
        brandedPartId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        skinId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        playerID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        qtyAvail: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        dealOfTheDayBrandedPartId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize: await getDatabase(),
        modelName: "Warehouse",
        tableName: "warehouses",
        timestamps: false,
        indexes: [
            {
                fields: ["brandedPartId", "skinId", "playerID"],
                unique: true,
            },
            {
                fields: ["brandedPartId"],
            },
            {
                fields: ["skinId"],
            },
            {
                fields: ["playerID"],
            }
        ],
    },
);
