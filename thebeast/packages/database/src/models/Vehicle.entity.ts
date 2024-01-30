import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IVehicle {
    vehicleId: number; // 4 bytes
    skinId: number; // 4 bytes
    flags: number; // 4 bytes
    delta: number; // 4 bytes
    carClass: number; // 1 byte
    damageLength: number; // 2 bytes
    damage: number; // 1 byte / max 2000
}

export type VehicleCreationAttributes = Optional<IVehicle, "vehicleId">;

export class Vehicle extends Model<IVehicle, VehicleCreationAttributes> {
    declare vehicleId: number; // 4 bytes
    declare skinId: number; // 4 bytes
    declare flags: number; // 4 bytes
    declare delta: number; // 4 bytes
    declare carClass: number; // 1 byte
    declare damageLength: number; // 2 bytes
    declare damage: number; // 1 byte / max 2000

    serialize(): Buffer {
        const buffer = Buffer.alloc(this.size());
        let offset = 0;
        buffer.writeUInt32LE(this.vehicleId, offset);
        offset += 4;
        buffer.writeUInt32LE(this.skinId, offset);
        offset += 4;
        buffer.writeUInt32LE(this.flags, offset);
        offset += 4;
        buffer.writeUInt32LE(this.delta, offset);
        offset += 4;
        buffer.writeUInt8(this.carClass, offset);
        offset += 1;
        buffer.writeUInt16LE(this.damageLength, offset);
        offset += 2;
        buffer.writeUInt8(this.damage, offset);

        return buffer;
    }

    size(): number {
        return 20;
    }
}

Vehicle.init(
    {
        vehicleId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        skinId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        flags: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        delta: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        carClass: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        damageLength: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        damage: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "vehicles",
        modelName: "vehicle",
    },
);
