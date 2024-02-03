import { Vehicle } from "../../../packages/database/src/models/Vehicle.entity.js";

export async function populateVehicles(): Promise<void> {
    await Vehicle.sync();

    await Vehicle.upsert({
        vehicleId: 1,
        skinId: 33,
        flags: 0,
        delta: 0,
        carClass: 3,
        damageLength: 0,
        damage: 0,
    });
}
