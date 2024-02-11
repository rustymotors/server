import { VehicleOwner } from "../../../packages/database/src/models/VehicleOwner.entity.js";

export async function populateVehicleOwners(): Promise<void> {
    await VehicleOwner.sync();

    await VehicleOwner.upsert({
        vehicleId: 1,
        currentOwnerId: 1,
    });
}
