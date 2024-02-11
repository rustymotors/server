import sequelize from "sequelize/lib/sequelize";
import { Player } from "../../../packages/database/src/models/Player.entity.js";
import { StockVehicleAttribs } from "../../../packages/database/src/models/StockVehicleAttribs.entity.js";
import { Vehicle } from "../../../packages/database/src/models/Vehicle.entity.js";
import { log } from "../../../packages/shared/log.js";
import { BrandedPart } from "../../../packages/database/src/models/BrandedPart.entity.js";
import { StockAssembly } from "../../../packages/database/src/models/StockAssembly.entity.js";

export async function populateVehicles(): Promise<void> {
    log.debug("Populating stock vehicle attribs");
    await StockVehicleAttribs.sync();

    log.debug("Populating vehicles");
    await Vehicle.sync();

    await Vehicle.upsert({
        VehicleID: 1,
        SkinID: 33,
        Flags: 0,
        Class: 0,
        InfoSetting: 0,
        DamageInfo: Buffer.alloc(2000),
        DamageCached: 0,
    });
}

export async function createVehicle(
    vehicleId: number,
    skinId: number,
    flags: number,
): Promise<void> {
    await Vehicle.sync();

    await Vehicle.upsert({
        VehicleID: vehicleId,
        SkinID: skinId,
        Flags: flags,
        Class: 0,
        InfoSetting: 0,
        DamageInfo: Buffer.from([0]),
        DamageCached: 0,
    });
}

export async function createNewCar(
    brandedPartid: number,
    skinId: number,
    playerId: number,
    shouldChargePlayer: boolean,
): Promise<void> {
    type tempRecord = {
        partId: number;
        parentPartId: number;
        brandedPartId: number;
        attachmentPointId: number;
        maxItemWear: number;
        retailPrice: number;
        abstractPartTypeId: number;
        parentAbstractPartTypeId: number;
    };

    await Vehicle.sync();

    if (brandedPartid > 999) {
        throw new Error(`Invalid brandedPartid: ${brandedPartid}`);
    }

    // Get the car's price
    const attribs = await StockVehicleAttribs.findByPk(brandedPartid);

    if (!attribs) {
        throw new Error(
            `Unable to find stock vehicle attribs for brandedPartid: ${brandedPartid}`,
        );
    }

    const price = attribs.retailPrice;

    // Charge the player
    if (shouldChargePlayer) {
        // TODO: Charge the player
    }

    // Update the player's car count
    try {
        await Player.update(
            { numberOfCarsOwned: sequelize.literal("numberOfCarsOwned + 1") },
            { where: { playerId } },
        );
    } catch (error) {
        throw new Error(`Unable to update player's car count: ${error}`);
    }

    let partCount = 0;

    const tmpTable: tempRecord[] = [];

    // Get all parts for the car
    const topPart = await BrandedPart.findByPk(brandedPartid);

    if (!topPart) {
        throw new Error(
            `Unable to find branded parts for brandedPartid: ${brandedPartid}`,
        );
    }

    // Add the top part to the temp table
    tmpTable.push({
        partId: 0, // TODO: Get the next partId
        parentPartId: 0, // Use the partId of the previous part
        brandedPartId: topPart.BrandedPartID,
        attachmentPointId: 0,
        maxItemWear: topPart.MaxItemWear,
        retailPrice: topPart.RetailPrice,
        abstractPartTypeId: 101,
        parentAbstractPartTypeId: 0,
    });

    // Add the rest of the parts to the temp table
    const childParts = await StockAssembly.findAll({
        where: { parentBrandedPartId: brandedPartid },
    });
}
