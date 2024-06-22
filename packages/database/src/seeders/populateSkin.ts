import { getServerLogger } from "rusty-motors-shared";
import { skin as skinSchema } from "rusty-motors-schema";
import { getDatabase } from "rusty-motors-database";
import * as Sentry from "@sentry/node";

const log = getServerLogger();
export async function populateSkin(): Promise<void> {
    log.setName("seeders/populateSkin");

    log.debug("Seeding skin");

    await getDatabase()
        .insert(skinSchema)
        .values([
            {
                skinId: 1,
                creatorId: 10,
                skinTypeId: 1,
                partTypeId: 101,
                eSkin: "Candy Apple Red",
                gSkin: null,
                fSkin: null,
                sSkin: null,
                iSkin: null,
                jSkin: null,
                swSkin: null,
                bSkin: null,
                price: 200,
                partFilename: "32fortin",
                h0: 1,
                s0: 211,
                v0: 255,
                c0: 128,
                x0: 32,
                y0: 255,
                h1: 1,
                s1: 211,
                v1: 255,
                c1: 128,
                x1: 32,
                y1: 255,
                h2: 1,
                s2: 211,
                v2: 255,
                c2: 128,
                x2: 32,
                y2: 255,
                h3: 1,
                s3: 211,
                v3: 255,
                c3: 128,
                x3: 32,
                y3: 255,
                h4: 1,
                s4: 211,
                v4: 255,
                c4: 128,
                x4: 32,
                y4: 255,
                h5: 1,
                s5: 211,
                v5: 255,
                c5: 128,
                x5: 32,
                y5: 255,
                h6: 1,
                s6: 211,
                v6: 255,
                c6: 128,
                x6: 32,
                y6: 255,
                h7: 1,
                s7: 211,
                v7: 255,
                c7: 128,
                x7: 32,
                y7: 255,
                defaultFlag: 0,
                creatorName: "Factory",
                commentText: "As per 32-Ford CSV",
            },
        ])
        .onConflictDoNothing()
        .then(() => {
            log.debug("Skin seeded");
        })
        .catch((error: Error) => {
            log.error(`Error seeding skin: ${error.message}`);
            Sentry.captureException(error);
        });
}
