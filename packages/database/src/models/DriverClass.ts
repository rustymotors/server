import { DataTypes, Model } from "sequelize";
import { getDatabase } from "../services/database.js";

export class DriverClass extends Model {}

DriverClass.init(
    {
        driverClassId: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        driverClass: {
            type: DataTypes.STRING,
            validate: {
                len: [1, 50],
            },
            allowNull: false,
        },
    },
    {
        sequelize: getDatabase(),
        modelName: "DriverClass",
        tableName: "driver_classes",
        timestamps: false,
        indexes: [
            {
                fields: ["driverClassId"],
                unique: true,
            },
        ],
    },
);

// Path: packages/database/src/models/DriverClass.ts
