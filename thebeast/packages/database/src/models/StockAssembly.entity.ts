import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IStockAssembly {
    parentBrandedPartId: number; // 4 bytes
    childBrandedPartId: number; // 4 bytes
    attachmentPointId: number; // 1 byte
    configDefault: number; // 1 byte
    physicsDefault: number; // 1 byte
}

export type StockAssemblyCreationAttributes = Optional<
    IStockAssembly,
    "parentBrandedPartId"
>;

export class StockAssembly extends Model<
    IStockAssembly,
    StockAssemblyCreationAttributes
> {
    declare parentBrandedPartId: number;
    declare childBrandedPartId: number;
    declare attachmentPointId: number;
    declare configDefault: number;
    declare physicsDefault: number;
}

StockAssembly.init(
    {
        parentBrandedPartId: {
            type: DataTypes.INTEGER,
            references: {
                model: "BrandedPart",
                key: "brandedPartid",
            },
        },
        childBrandedPartId: {
            type: DataTypes.INTEGER,
            references: {
                model: "BrandedPart",
                key: "brandedPartid",
            },
        },
        attachmentPointId: {
            type: DataTypes.INTEGER,
            references: {
                model: "AttachmentPoint",
                key: "attachmentPointId",
            },
        },
        configDefault: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        physicsDefault: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "stock_assembly",
        modelName: "stockAssembly",
    },
);
