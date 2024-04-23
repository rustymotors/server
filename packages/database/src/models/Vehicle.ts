import { DataTypes, Model, type InferAttributes } from "sequelize";
import { getDatabase } from "../services/database.js";
import { Part } from "./Part.js";
import { PTSkin } from "./PTSkin.js";

export class Vehicle extends Model<InferAttributes<Vehicle>> {
    declare vehicleId: number;
    declare skinId: number;
    declare flags: number;
    declare class: number;
    declare infoSetting: number;
    declare damageInfo: Buffer;
    declare damageCached: number;
}

Vehicle.init(
    {
        vehicleId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            allowNull: false,
            references: {
                model: Part,
                key: "partId",
            },
            onDelete: "CASCADE",
        },
        skinId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: PTSkin,
                key: "skinId",
            },
        },
        flags: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        class: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        infoSetting: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        damageInfo: {
            type: DataTypes.BLOB,
            allowNull: false,
        },
        damageCached: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
    },
    {
        sequelize: getDatabase(),
        modelName: "Vehicle",
        tableName: "vehicles",
        timestamps: false,
        paranoid: true,
        indexes: [
            {
                fields: ["vehicleId"],
                unique: true,
            },
        ],
    },
);

// Path: packages/database/src/models/Vehicle.ts
