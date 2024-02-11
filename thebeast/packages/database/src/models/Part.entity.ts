import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IPart {
    partId: number; // 4 bytes
    parentPartId: number | null; // 4 bytes
    brandedPartId: number; // 4 bytes
    name: string; // Not serialized
    repairPrice: number; // 4 bytes
    junkPrice: number; // 4 bytes
    wear: number; // 4 bytes
    attachmentPoint: number; // 1 byte
    damage: number; // 1 byte
}

export type PartCreationAttributes = Optional<IPart, "partId">;

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
        const buffer = Buffer.alloc(this.size());
        buffer.writeInt32LE(this.partId, 0);
        buffer.writeInt32LE(this.parentPartId, 4);
        buffer.writeInt32LE(this.brandedPartId, 8);
        buffer.writeInt32LE(this.repairPrice, 12);
        buffer.writeInt32LE(this.junkPrice, 16);
        buffer.writeInt32LE(this.wear, 20);
        buffer.writeInt8(this.attachmentPoint, 24);
        buffer.writeInt8(this.damage, 25);
        return buffer;
    }

    size(): number {
        return 26;
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
            allowNull: true,
            references: {
                model: "Part",
                key: "partId",
            },
        },
        brandedPartId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "BrandedPart",
                key: "brandedPartId",
            },
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
            references: {
                model: "AttachmentPoint",
                key: "attachmentPointId",
            },
        },
        damage: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "Part",
        modelName: "Part",
    },
);
