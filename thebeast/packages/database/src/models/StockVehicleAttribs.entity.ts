import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IStockVehicleAttribs {
    brandedPartid: number;
    carClass: number;
    aiRestrictionClass: number;
    modeRestrictionClass: number;
    sponsor: number;
    vinBrandedPartid: number;
    trackId: number;
    vinCrc: number;
    retailPrice: number;
}

// export type StockVehicleAttribsCreationAttributes = Optional<IStockVehicleAttribs, "aiRestrictionClass" | "modeRestrictionClass" | "sponsor" | "vinBrandedPartid" | "trackId" | "vinCrc" | "retailPrice">;

export class StockVehicleAttribs extends Model<IStockVehicleAttribs> {
    declare brandedPartid: number;
    declare carClass: number;
    declare aiRestrictionClass: number;
    declare modeRestrictionClass: number;
    declare sponsor: number;
    declare vinBrandedPartid: number;
    declare trackId: number;
    declare vinCrc: number;
    declare retailPrice: number;
}

StockVehicleAttribs.init(
    {
        brandedPartid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        carClass: {
            type: DataTypes.INTEGER,
        },
        aiRestrictionClass: {
            type: DataTypes.INTEGER,
        },
        modeRestrictionClass: {
            type: DataTypes.INTEGER,
        },
        sponsor: {
            type: DataTypes.INTEGER,
        },
        vinBrandedPartid: {
            type: DataTypes.INTEGER,
        },
        trackId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        vinCrc: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        retailPrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1000,
        },
    },
    {
        sequelize,
        tableName: "stock_vehicle_attribs",
        modelName: "stockVehicleAttribs",
    },
);
