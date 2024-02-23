"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var migrator_1 = require("@slonik/migrator");
var database_js_1 = require("./thebeast/packages/database/src/services/database.js");
var migrator = new migrator_1.SlonikMigrator({
    migrationsPath: "migrations",
    migrationTableName: "migration",
    // @ts-ignore We know this works
    slonik: database_js_1.slonik,
    logger: migrator_1.SlonikMigrator.prettyLogger,
});
migrator.runAsCLI();
