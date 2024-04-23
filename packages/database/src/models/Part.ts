import { DataTypes, Model, type InferAttributes } from "sequelize";
import { getDatabase } from "../services/database.js";
import { BrandedPart } from "./BrandedPart.js";
import { AttachmentPoint } from "./AttachmentPoint.js";
import { NextPartSeq } from "./NextPartSeq.js";

export class Part extends Model<InferAttributes<Part>> {
    declare partId: number;
    declare parentPartId: number | null;
    declare brandedPartId: number;
    declare percentDamage: number;
    declare itemWear: number;
    declare attachmentPointId: number | null;
    declare ownerID: number | null;
    declare partName: string | null;
    declare repairCost: number;
    declare scrapValue: number;
}

Part.init(
    {
        partId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            async set(value?: number) {
                if (value === undefined) {
                    value = await NextPartSeq.getNextPartSeq();
                }

                if (value === undefined) {
                    throw new Error("NextPartSeq not found");
                }

                this.setDataValue("partId", value);
            }
        },
        parentPartId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            references: {
                model: Part,
                key: "partId",
            },
        },
        brandedPartId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: BrandedPart,
                key: "brandedPartId",
            },
        },
        percentDamage: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        itemWear: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        attachmentPointId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            references: {
                model: AttachmentPoint,
                key: "attachmentPointId",
            },
        },
        ownerID: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        partName: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        repairCost: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        scrapValue: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize: getDatabase(),
        modelName: "Part",
        tableName: "parts",
        timestamps: false,
        indexes: [
            {
                fields: ["partId"],
                unique: true,
            },
        ],
    },
);

// Path: packages/database/src/models/Part.ts
