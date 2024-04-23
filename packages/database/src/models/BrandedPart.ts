import { DataTypes, Model as BaseModel, type InferAttributes, type HasOneGetAssociationMixin } from "sequelize";
import { getDatabase } from "../services/database.js";
import { PartType } from "./PartType.js";
import { Model } from "./Model.js";

export class BrandedPart extends BaseModel<InferAttributes<BrandedPart>> {
    declare brandedPartId: number;
    declare partTypeId: HasOneGetAssociationMixin<PartType>;
    declare modelId: HasOneGetAssociationMixin<Model>;
    declare mfgDate: Date;
    declare qtyAvail: number;
    declare retailPrice: number;
    declare maxItemWear: number | null;
    declare engineBlockFamilyId: number;

    declare partType?: InferAttributes<PartType>;

    declare model?: InferAttributes<Model>;
}

BrandedPart.init(
    {
        brandedPartId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            allowNull: false,
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
        sequelize: getDatabase(),
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

BrandedPart.belongsTo(PartType, {
    foreignKey: "partTypeId",
    targetKey: "partTypeId",
    as: "partType",
});

PartType.hasMany(BrandedPart, {
    foreignKey: "partTypeId",
    sourceKey: "partTypeId",
    as: "brandedParts",
});

BrandedPart.belongsTo(Model, {
    foreignKey: "modelId",
    targetKey: "modelId",
    as: "model",
});

Model.hasMany(BrandedPart, {
    foreignKey: "modelId",
    sourceKey: "modelId",
    as: "brandedParts",
});


// Path: packages/database/src/models/BrandedPart.ts
