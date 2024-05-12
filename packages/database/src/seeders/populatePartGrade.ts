import { getServerLogger } from "rusty-motors-shared";
import { partGrade as partGradeSchema } from "../../../../schema/partGrade.js";
import { getDatabase } from "../services/database.js";
import * as Sentry from "@sentry/node";

const log = getServerLogger();
export async function populatePartGrade(): Promise<void> {
    log.setName("seeders/populatePartGrade");

    log.debug("Seeding partGrade");

    await getDatabase()
        .insert(partGradeSchema)
        .values([
            {
                partGradeId: 1,
                eText: "Stock",
                gText: null,
                fText: null,
                partGrade: null,
            },
        ])
        .onConflictDoNothing()
        .then(() => {
            log.debug("PartGrade seeded");
        })
        .catch((error: Error) => {
            log.error(`Error seeding partGrade: ${error.message}`);
            Sentry.captureException(error);
        });
}



