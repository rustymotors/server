import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IBrand {
    BrandId: number;
    Brand: string;
    PicName: string;
    IsStock: number;
}

export class Brand extends Model<IBrand> {
    declare BrandId: number;
    declare Brand: string;
    declare PicName: string;
    declare IsStock: number;
}

Brand.init(
    {
        BrandId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        Brand: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        PicName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        IsStock: {
            type: DataTypes.SMALLINT,
            allowNull: true,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: "Brand",
        modelName: "Brand",
    },
);
