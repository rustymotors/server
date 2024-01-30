import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IPart {
    partId: number; // 4 bytes
    parentPartId: number; // 4 bytes
    brandedPartId: number; // 4 bytes
    name: string; // Not serialized
    repairPrice: number; // 4 bytes
    junkPrice: number; // 4 bytes
    wear: number; // 4 bytes
    attachmentPoint: number; // 1 byte
    damage: number; // 1 byte
}

export type PartCreationAttributes = [];

export class Part extends Model<IPart, PartCreationAttributes> {
    declare partId: number;
    declare parentPartId: number;
    declare brandedPartId: number;
    declare name: string;
    declare repairPrice: number;
    declare junkPrice: number;
    declare wear: number;
    declare attachmentPoint: number;
    declare damage: number;

    serialize(): Buffer {
        const buffer = Buffer.alloc(24);
        let offset = 0;
        buffer.writeUInt32LE(this.partId, offset);
        offset += 4;
        buffer.writeUInt32LE(this.parentPartId, offset);
        offset += 4;
        buffer.writeUInt32LE(this.brandedPartId, offset);
        offset += 4;
        buffer.writeUInt32LE(this.repairPrice, offset);
        offset += 4;
        buffer.writeUInt32LE(this.junkPrice, offset);
        offset += 4;
        buffer.writeUInt32LE(this.wear, offset);
        offset += 4;
        buffer.writeUInt8(this.attachmentPoint, offset);
        offset += 1;
        buffer.writeUInt8(this.damage, offset);
        return buffer;
    }

    size(): number {
        return 24;
    }
}

Part.init(
    {
        partId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
        },
        parentPartId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        brandedPartId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        repairPrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        junkPrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        wear: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        attachmentPoint: {
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
        tableName: "parts",
        modelName: "part",
    },
);
