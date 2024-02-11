import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../services/database.js";

interface IVehicleOwner {
    vehicleId: number; // 4 bytes
    currentOwnerId: number; // 4 bytes
}

export class VehicleOwner extends Model<IVehicleOwner> {
    declare vehicleId: number; // 4 bytes
    declare currentOwnerId: number; // 4 bytes
}

VehicleOwner.init(
    {
        vehicleId: {
            type: DataTypes.INTEGER,
        },
        currentOwnerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "vehicle_owners",
        modelName: "vehicle_owner",
    },
);
