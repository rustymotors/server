import {
    DataTypes,
    Model,
    type HasManyGetAssociationsMixin,
    type HasOneGetAssociationMixin,
    type InferAttributes,
} from "sequelize";
import { getDatabase } from "../services/database.js";
import { AbstractPartType } from "./AbstractPartType.js";
import { PartGrade } from "./PartGrade.js";

export class PartType extends Model<InferAttributes<PartType>> {
    declare partTypeId: number;
    declare abstractPartType: HasManyGetAssociationsMixin<AbstractPartType>;
    declare partGrade: HasOneGetAssociationMixin<PartGrade>;
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

PartType.belongsTo(AbstractPartType, {
    foreignKey: "partTypeId",
    as: "abstractPartType",
});

PartType.belongsTo(PartGrade, {
    foreignKey: "partTypeId",
    as: "partGrade",
});

// Path: packages/database/src/models/PartType.ts
