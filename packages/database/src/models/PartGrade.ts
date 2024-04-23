import { DataTypes, Model } from "sequelize";
import { getDatabase } from "../services/database.js";

export class PartGrade extends Model {}

PartGrade.init(
    {
        partGradeId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        eText: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 50],
            },
        },
        gText: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 50],
            },
        },
        fText: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 50],
            },
        },
        partGrade: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                len: [1, 100],
            },
        },
    },
    {
        sequelize: getDatabase(),
        modelName: "PartGrade",
        tableName: "part_grades",
        timestamps: false,
        indexes: [
            {
                fields: ["partGradeId"],
                unique: true,
            },
        ],
    },
);

// Path: packages/database/src/models/PartGrade.ts
