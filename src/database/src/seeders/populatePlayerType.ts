import { getDatabase } from "@rustymotors/database";
import { playerType as playerTypeSchema } from "@rustymotors/schema";
import { getServerLogger } from "@rustymotors/shared";
import * as Sentry from "@sentry/node";

const log = getServerLogger();
export async function populatePlayerType(): Promise<void> {
  log.setName("seeders/populatePlayerType");

  log.debug("Seeding playerType");

  await getDatabase()
    .insert(playerTypeSchema)
    .values([
      {
        playerTypeId: 1,
        playerType: "System",
      },
    ])
    .onConflictDoNothing()
    .then(() => {
      log.debug("PlayerType seeded");
    })
    .catch((error: Error) => {
      log.error(`Error seeding playerType: ${error.message}`);
      Sentry.captureException(error);
    });
}
