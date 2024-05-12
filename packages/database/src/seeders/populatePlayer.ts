import { getServerLogger } from "rusty-motors-shared";
import { player as playerSchema } from "../../../../schema/player.js";
import { getDatabase } from "../services/database.js";
import * as Sentry from "@sentry/node";

const log = getServerLogger();

export async function populatePlayer(): Promise<void> {
    log.setName("seeders/populatePlayer");

    log.debug("Seeding player");

    await getDatabase()
        .insert(playerSchema)
        .values([
            {
                playerId: 6,
                customerId: 0,
                playerTypeId: 1,
                sanctionedScore: 0,
                challengeScore: 0,
                lastLoggedIn: new Date(0),
                timesLoggedIn: 0,
                bankBalance: 999999,
                numCarsOwned: 0,
                isLoggedIn: 0,
                driverStyle: 0,
                lpCode: 0,
                lpText: null,
                dlNumber: "xxx",
                persona: "All Factory Ford",
                address: "1240 A Street",
                residence: "ABCDEFGHIJKLMNOPQRST",
            },
            {
                playerId: 8,
                customerId: 0,
                playerTypeId: 1,
                sanctionedScore: 0,
                challengeScore: 0,
                lastLoggedIn: new Date(0),
                timesLoggedIn: 0,
                bankBalance: 999999,
                numCarsOwned: 0,
                isLoggedIn: 0,
                driverStyle: 0,
                lpCode: 0,
                lpText: null,
                dlNumber: "xxx",
                persona: "Scrappy",
                address: "1243 A Street",
                residence: "ABCDEFGHIJKLMNOPQRST",
            },
            {
                playerId: 10,
                customerId: 0,
                playerTypeId: 1,
                sanctionedScore: 0,
                challengeScore: 0,
                lastLoggedIn: new Date(0),
                timesLoggedIn: 0,
                bankBalance: 999999,
                numCarsOwned: 0,
                isLoggedIn: 0,
                driverStyle: 0,
                lpCode: 0,
                lpText: null,
                dlNumber: "xxx",
                persona: "Joe",
                address: "1244 A Street",
                residence: "ABCDEFGHIJKLMNOPQRST",
            },
        ])
        .onConflictDoNothing()
        .finally(() => {
            log.debug("Player seeded");
        })
        .catch((error: Error) => {
            log.error(`Error seeding player: ${error.message}`);
            Sentry.captureException(error);
        });
}
