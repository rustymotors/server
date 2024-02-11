import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IPartGrade {
    partGradeId: number; // 4 bytes
    eText: string; // Not serialized
    gText: string; // Not serialized
    fText: string; // Not serialized
    partGrade: string; // Not serialized
}

export type PartGradeCreationAttributes = Optional<IPartGrade, "partGradeId">;

export class PartGrade extends Model<IPartGrade, PartGradeCreationAttributes> {
    declare partGradeId: number;
    declare eText: string;
    declare gText: string;
    declare fText: string;
    declare partGrade: string;
}

PartGrade.init(
    {
        partGradeId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
        },
        eText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        partGrade: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "part_grade",
        modelName: "partGrade",
    },
);
