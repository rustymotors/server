import { SlonikMigrator } from "@slonik/migrator";
import { getDatabase } from "./packages/database/src/services/database.js";

const migrator = new SlonikMigrator({
    migrationsPath: "migrations",
    migrationTableName: "migration",
    slonik: (await getDatabase()).slonik,
    logger: SlonikMigrator.prettyLogger,
});

migrator.runAsCLI();
