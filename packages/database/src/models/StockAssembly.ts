import { DataTypes, Model as BaseModel, type InferAttributes } from "sequelize";
import { getDatabase } from "../services/database.js";
import { AttachmentPoint } from "./AttachmentPoint.js";
import { BrandedPart } from "./BrandedPart.js";

export class StockAssembly extends BaseModel<InferAttributes<StockAssembly>> {
    declare parentBrandedPartId: number;
    declare childBrandedPartId: number;
    declare attachmentPointId: number;
    declare configDefault: boolean;
    declare physicsDefault: boolean;
}

StockAssembly.init(
    {
        parentBrandedPartId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: BrandedPart,
                key: "brandedPartId",
            },
        },
        childBrandedPartId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: BrandedPart,
                key: "brandedPartId",
            },
        },
        attachmentPointId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: AttachmentPoint,
                key: "attachmentPointId",
            },
        },
        configDefault: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        physicsDefault: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        sequelize: await getDatabase(),
        modelName: "StockAssembly",
        tableName: "stock_assemblies",
        timestamps: false,
        indexes: [
            {
                fields: ["parentBrandedPartId", "childBrandedPartId", "AttachmentPointId"],
                unique: true,
            },
            {
                fields: ["parentBrandedPartId"],
            },
            {
                fields: ["childBrandedPartId"],
            },
            {
                fields: ["AttachmentPointId"],
            }
        ],
    },
);

// Path: packages/database/src/models/StockAssembly.ts
