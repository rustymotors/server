import { getServerLogger } from "rusty-motors-shared";
import { skinType as skinTypeSchema } from "rusty-motors-schema";
import { getDatabase } from "rusty-motors-database";
import * as Sentry from "@sentry/node";

const log = getServerLogger();
export async function populateSkinType(): Promise<void> {
    log.setName("seeders/populateSkinType");

    log.debug("Seeding skinType");

    await getDatabase()
        .insert(skinTypeSchema)
        .values([
            {
                skinTypeId: 1,
                skinType: "Tinted",
            },
        ])
        .onConflictDoNothing()
        .then(() => {
            log.debug("SkinType seeded");
        })
        .catch((error: Error) => {
            log.error(`Error seeding skinType: ${error.message}`);
            Sentry.captureException(error);
        });
}

