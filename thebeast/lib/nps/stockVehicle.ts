import { StockVehicleAttribs } from "../../packages/database/src/models/StockVehicleAttribs.entity.js";
import { Vehicle } from "../../packages/database/src/models/Vehicle.entity.js";
import { log } from "../../packages/shared/log.js";

export async function populateStockVehiclesAttribs(): Promise<void> {
    log.debug("Populating stock vehicle attribs");
    await StockVehicleAttribs.sync();

    await StockVehicleAttribs.upsert({
        brandedPartid: 130,
        carClass: 3,
        aiRestrictionClass: 0,
        modeRestrictionClass: 0,
        sponsor: 0,
        vinBrandedPartid: 130,
        trackId: 0,
        vinCrc: 1478345654,
        retailPrice: 55586,
    });
}

export async function populateStockVehicles(): Promise<void> {
    log.debug("Populating vehicles");
    await Vehicle.sync();

    await Vehicle.upsert({
        VehicleID: 1,
        SkinID: 33,
        Flags: 0,
        Class: 0,
        InfoSetting: 0,
        DamageInfo: Buffer.from([0]),
        DamageCached: 0,
    });
}
