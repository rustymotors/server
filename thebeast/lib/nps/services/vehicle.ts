import { Vehicle } from "../../../packages/database/src/models/Vehicle.entity.js";

export async function populateVehicles(): Promise<void> {
    await Vehicle.sync();
}
