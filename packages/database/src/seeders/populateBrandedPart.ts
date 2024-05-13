import { getServerLogger } from "rusty-motors-shared";
import { brandedPart as brandedPartSchema } from "rusty-motors-schema";
import { getDatabase } from "../services/database.js";
import * as Sentry from "@sentry/node";

const log = getServerLogger();
export async function populateBrandedPart(): Promise<void> {
    log.setName("seeders/populateBrandedPart");

    log.debug("Seeding brandedPart");

    await getDatabase()
        .insert(brandedPartSchema)
        .values([
            {
                brandedPartId: 104,
                partTypeId: 104,
                modelId: 21,
                qtyAvail: 1000,
                retailPrice: 0,
                maxItemWear: 30000,
            },
            {
                brandedPartId: 111,
                partTypeId: 111,
                modelId: 36,
                qtyAvail: 0,
                retailPrice: 0,
                maxItemWear: 30000,
            },
            {
                brandedPartId: 117,
                partTypeId: 117,
                modelId: 26,
                qtyAvail: 0,
                retailPrice: 0,
                maxItemWear: 30000,
            },
            {
                brandedPartId: 125,
                partTypeId: 125,
                modelId: 9,
                qtyAvail: 0,
                retailPrice: 0,
                maxItemWear: 30000,
            },
            {
                brandedPartId: 130,
                partTypeId: 130,
                modelId: 20,
                qtyAvail: 0,
                retailPrice: 0,
                maxItemWear: 30000,
            },
            {
                brandedPartId: 339,
                partTypeId: 214,
                modelId: 2183,
                qtyAvail: 0,
                retailPrice: 0,
                maxItemWear: 1500,
            },
            {
                brandedPartId: 353,
                partTypeId: 228,
                modelId: 2197,
                qtyAvail: 0,
                retailPrice: 0,
                maxItemWear: 1500,
            },
            {
                brandedPartId: 379,
                partTypeId: 103,
                modelId: 2371,
                qtyAvail: 0,
                retailPrice: 0,
                maxItemWear: 1500,
            },
            {
                brandedPartId: 384,
                partTypeId: 108,
                modelId: 2377,
                qtyAvail: 0,
                retailPrice: 0,
                maxItemWear: 1500,
            },
            {
                brandedPartId: 389,
                partTypeId: 132,
                modelId: 2382,
                qtyAvail: 0,
                retailPrice: 0,
                maxItemWear: 1500,
            },
            {
                brandedPartId: 394,
                partTypeId: 120,
                modelId: 2387,
                qtyAvail: 0,
                retailPrice: 0,
                maxItemWear: 1500,
            },
        ])
        .onConflictDoNothing()
        .then(() => {
            log.debug("BrandedPart seeded");
        })
        .catch((error: Error) => {
            log.error(`Error seeding brandedPart: ${error.message}`);
            Sentry.captureException(error);
        });
}

