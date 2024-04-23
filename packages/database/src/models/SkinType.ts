import { DataTypes, Model, type InferAttributes } from "sequelize";
import { getDatabase } from "../services/database.js";

export class SkinType extends Model<InferAttributes<SkinType>> {
    declare skinTypeId: number;
    declare skinType: string;
}

SkinType.init(
    {
        skinTypeId: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        skinType: {
            type: DataTypes.STRING,
            validate: {
                len: [1, 50],
            },
            allowNull: false,
        },
    },
    {
        sequelize: getDatabase(),
        modelName: "SkinType",
        tableName: "skin_types",
        timestamps: false,
        indexes: [
            {
                fields: ["skinTypeId"],
                unique: true,
            },
        ],
    },
);

// Path: packages/database/src/models/SkinType.ts
