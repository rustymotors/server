import { getServerLogger } from "rusty-motors-shared";
import { warehouse as wareHouseSchema } from "rusty-motors-schema";
import { getDatabase } from "rusty-motors-database";
import * as Sentry from "@sentry/node";

const log = getServerLogger();
export async function populateWarehouse(): Promise<void> {
    log.setName("seeders/populateWarehouse");

    log.debug("Seeding warehouse");

    await getDatabase()
        .insert(wareHouseSchema)
        .values([
            // All Factory Ford
            {
                brandedPartId: 104,
                playerId: 6,
                isDealOfTheDay: 0,
                skinId: 1, // is ignored
                qtyAvail: 999, // is ignored
            },
            {
                brandedPartId: 111,
                playerId: 6,
                isDealOfTheDay: 0,
                skinId: 1, // is ignored
                qtyAvail: 999, // is ignored
            },
            {
                brandedPartId: 117,
                playerId: 6,
                isDealOfTheDay: 0,
                skinId: 1, // is ignored
                qtyAvail: 999, // is ignored
            },
            {
                brandedPartId: 125,
                playerId: 6,
                isDealOfTheDay: 0,
                skinId: 1, // is ignored
                qtyAvail: 999, // is ignored
            },
            {
                brandedPartId: 339,
                playerId: 6,
                isDealOfTheDay: 0,
                skinId: 1, // is ignored
                qtyAvail: 999, // is ignored
            },
            {
                brandedPartId: 353,
                playerId: 6,
                isDealOfTheDay: 0,
                skinId: 1, // is ignored
                qtyAvail: 999, // is ignored
            },
            {
                brandedPartId: 379,
                playerId: 6,
                isDealOfTheDay: 0,
                skinId: 1, // is ignored
                qtyAvail: 999, // is ignored
            },
            {
                brandedPartId: 384,
                playerId: 6,
                isDealOfTheDay: 0,
                skinId: 1, // is ignored
                qtyAvail: 999, // is ignored
            },
            {
                brandedPartId: 389,
                playerId: 6,
                isDealOfTheDay: 0,
                skinId: 1, // is ignored
                qtyAvail: 999, // is ignored
            },
            {
                brandedPartId: 394,
                playerId: 6,
                isDealOfTheDay: 0,
                skinId: 1, // is ignored
                qtyAvail: 999, // is ignored
            },
            // Scrappy's Cars
            {
                brandedPartId: 394,
                playerId: 8,
                isDealOfTheDay: 0,
                skinId: 1, // is ignored
                qtyAvail: 999, // is ignored
            },
            {
                brandedPartId: 384,
                playerId: 8,
                isDealOfTheDay: 0,
                skinId: 1, // is ignored
                qtyAvail: 999, // is ignored
            },
            {
                brandedPartId: 389,
                playerId: 8,
                isDealOfTheDay: 0,
                skinId: 1, // is ignored
                qtyAvail: 999, // is ignored
            },
            {
                brandedPartId: 394,
                playerId: 8,
                isDealOfTheDay: 0,
                skinId: 1, // is ignored
                qtyAvail: 999, // is ignored
            },
        ])
        .onConflictDoNothing()
        .then(() => {
            log.debug("Warehouse seeded");
        })
        .catch((error: Error) => {
            log.error(`Error seeding warehouse: ${error.message}`);
            Sentry.captureException(error);
        });
}
