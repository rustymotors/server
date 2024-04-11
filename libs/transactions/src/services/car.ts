import { VehicleModel } from "../models/VehicleModel.js";

const vehicles = new Map<number, VehicleModel>();
const nextVehicleId = 1;

export function getVehicle(vehicleId: number): VehicleModel | undefined {
    return vehicles.get(vehicleId);
}

export function createVehicle(): VehicleModel {
    const vehicle = new VehicleModel(nextVehicleId);
    vehicles.set(nextVehicleId, vehicle);
    return vehicle;
}

export function deleteVehicle(vehicleId: number): void {
    vehicles.delete(vehicleId);
}

export function clearVehicles(): void {
    vehicles.clear();
}

export function getVehicleCount(): number {
    return vehicles.size;
}
