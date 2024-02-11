import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IPartType {
    PartTypeID: number; // 4 bytes
    AbstractPartTypeID: number; // 4 bytes
    PartType: string; // Not serialized
    PartFilename: string; // Not serialized
    PartGradeID: number; // 4 bytes
}

export type PartTypeCreationAttributes = Optional<IPartType, "PartTypeID">;

export class PartType extends Model<IPartType, PartTypeCreationAttributes> {
    declare PartTypeID: number;
    declare AbstractPartTypeID: number;
    declare PartType: string;
    declare PartFilename: string;
    declare PartGradeID: number;
}

PartType.init(
    {
        PartTypeID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
        },
        AbstractPartTypeID: {
            type: DataTypes.INTEGER,
            references: {
                model: "AbstractPartType",
                key: "abstractPartTypeId",
            },
        },
        PartType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        PartFilename: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        PartGradeID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "PartGrade",
                key: "partGradeId",
            },
        },
    },
    {
        sequelize,
        tableName: "part_type",
        modelName: "partType",
    },
);
