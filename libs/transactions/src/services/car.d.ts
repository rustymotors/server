import { VehicleModel } from "../models/VehicleModel.js";
export declare function getVehicle(vehicleId: number): VehicleModel | undefined;
export declare function createVehicle(): VehicleModel;
export declare function deleteVehicle(vehicleId: number): void;
export declare function clearVehicles(): void;
export declare function getVehicleCount(): number;
