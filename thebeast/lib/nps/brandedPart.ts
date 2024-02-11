import { BrandedPart } from "../../packages/database/src/models/BrandedPart.entity.js";
import { log } from "../../packages/shared/log.js";

export async function populateBrandedParts(): Promise<void> {
    log.debug("Populating branded parts");
    await BrandedPart.sync();

    await BrandedPart.upsert({
        BrandedPartID: 130,
        PartTypeID: 130,
        ModelID: 20,
        MfgDate: new Date("1973-01-01 00:00:00.000"),
        QtyAvail: 0,
        RetailPrice: 0,
        MaxItemWear: 30000,
        EngineBlockFamilyID: 0,
    });
}
