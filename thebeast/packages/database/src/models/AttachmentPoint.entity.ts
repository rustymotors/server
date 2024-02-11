import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IAttachmentPoint {
    attachmentPointId: number; // 4 bytes
    attachmentPoint: string; // Not serialized
}

export type AttachmentPointCreationAttributes = Optional<
    IAttachmentPoint,
    "attachmentPointId"
>;

export class AttachmentPoint extends Model<
    IAttachmentPoint,
    AttachmentPointCreationAttributes
> {
    declare attachmentPointId: number;
    declare attachmentPoint: string;
}

AttachmentPoint.init(
    {
        attachmentPointId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        attachmentPoint: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "AttachmentPoint",
        modelName: "AttachmentPoint",
    },
);
