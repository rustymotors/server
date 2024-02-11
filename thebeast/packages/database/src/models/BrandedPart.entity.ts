import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IBrandedPart {
    BrandedPartID: number;
    PartTypeID: number;
    ModelID: number;
    MfgDate: Date;
    QtyAvail: number;
    RetailPrice: number;
    MaxItemWear: number;
    EngineBlockFamilyID: number;
}

export class BrandedPart extends Model<IBrandedPart> {
    declare BrandedPartID: number;
    declare PartTypeID: number;
    declare ModelID: number;
    declare MfgDate: Date;
    declare QtyAvail: number;
    declare RetailPrice: number;
    declare MaxItemWear: number;
    declare EngineBlockFamilyID: number;
}

BrandedPart.init(
    {
        BrandedPartID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        PartTypeID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ModelID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Model",
                key: "ModelID",
            },
        },
        MfgDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        QtyAvail: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        RetailPrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        MaxItemWear: {
            type: DataTypes.SMALLINT,
        },
        EngineBlockFamilyID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: "BrandedPart",
        timestamps: false,
    },
);
