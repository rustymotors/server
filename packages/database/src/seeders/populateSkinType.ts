import { getServerLogger } from "../../../shared";
import { skinType as skinTypeSchema } from "../../../../schema/skinType";
import { getDatabase } from "../services/database";
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
