import { DataTypes, Model as BaseModel, type InferAttributes } from "sequelize";
import { getDatabase } from "../services/database.js";
import { PartType } from "./PartType.js";
import { Model } from "./Model.js";

export class BrandedPart extends BaseModel<InferAttributes<BrandedPart>> {
    declare brandedPartId: number;
    declare partTypeId: number;
    declare modelId: number;
    declare mfgDate: Date;
    declare qtyAvail: number;
    declare retailPrice: number;
    declare maxItemWear: number | null;
    declare engineBlockFamilyId: number;
}

BrandedPart.init(
    {
        brandedPartId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        partTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: PartType,
                key: "partTypeId",
            },
        },
        modelId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Model,
                key: "modelId",
            },
        },
        mfgDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        qtyAvail: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        retailPrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        maxItemWear: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
        engineBlockFamilyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize: await getDatabase(),
        modelName: "BrandedPart",
        tableName: "branded_parts",
        timestamps: false,
        indexes: [
            {
                fields: ["brandedPartId"],
                unique: true,
            },
            {
                fields: ["partTypeId"],
            },
            {
                fields: ["modelId"],
            }
        ],
    },
);

// Path: packages/database/src/models/BrandedPart.ts
