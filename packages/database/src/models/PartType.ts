import { DataTypes, Model, type InferAttributes } from "sequelize";
import { getDatabase } from "../services/database.js";
import { AbstractPartType } from "./AbstractPartType.js";
import { PartGrade } from "./PartGrade.js";

export class PartType extends Model<InferAttributes<PartType>> {
    declare partTypeId: number;
    declare abstractPartTypeId: number;
    declare partGradeId: number;
    declare partType: string;
    declare partFilename: string;
}

PartType.init(
    {
        partTypeId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        abstractPartTypeId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            references: {
                model: AbstractPartType,
                key: "abstractPartTypeId",
            },
        },
        partGradeId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            references: {
                model: PartGrade,
                key: "partGradeId",
            },
        },
        partType: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
        partFilename: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 20],
            },
        },
    },
    {
        sequelize: getDatabase(),
        modelName: "PartType",
        tableName: "part_types",
        timestamps: false,
        indexes: [
            {
                fields: ["partTypeId"],
                unique: true,
            },
        ],
    },
);

// Path: packages/database/src/models/PartType.ts
