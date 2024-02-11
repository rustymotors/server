import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IVehicle {
    VehicleID: number;
    SkinID: number;
    Flags: number;
    Class: number;
    InfoSetting: number;
    DamageInfo: Buffer;
    DamageCached: number;
}

export class Vehicle extends Model<IVehicle> {
    declare VehicleID: number;
    declare SkinID: number;
    declare Flags: number;
    declare Class: number;
    declare InfoSetting: number;
    declare DamageInfo: Buffer;
    declare DamageCached: number;

    serialize(): Buffer {
        const buffer = Buffer.alloc(this.size());
        buffer.writeInt32LE(this.VehicleID, 0);
        buffer.writeInt32LE(this.SkinID, 4);
        buffer.writeInt32LE(this.Flags, 8);
        // Delta
        buffer.writeInt16LE(0, 12);
        buffer.writeInt16LE(this.Class, 12);
        // DamageInfo length
        buffer.writeInt16LE(this.DamageInfo.length, 14);
        // If DamageInfo length is 0, we don't need to copy the buffer
        if (this.DamageInfo.length > 0) {
            this.DamageInfo.copy(buffer, 16);
        }
        return buffer;
    }

    size(): number {
        return 19 + this.DamageInfo.length;
    }

    toSting() {
        return `Vehicle: ${this.VehicleID}, Skin: ${this.SkinID}, Flags: ${this.Flags}, CarClass: ${this.Class}, InfoSetting: ${this.InfoSetting}, DamageInfo: ${this.DamageInfo}, DamageCached: ${this.DamageCached}`;
    }
}

Vehicle.init(
    {
        VehicleID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        SkinID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Flags: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Class: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        InfoSetting: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 0,
        },
        DamageInfo: {
            type: DataTypes.BLOB,
            allowNull: false,
        },
        DamageCached: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: "Vehicle",
        modelName: "Vehicle",
    },
);
