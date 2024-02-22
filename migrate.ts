import { SlonikMigrator } from '@slonik/migrator';
import { slonik } from './thebeast/packages/database/src/services/database.js';

const migrator = new SlonikMigrator({
  migrationsPath: 'migrations',
  migrationTableName: 'migration',
  // @ts-ignore We know this works
  slonik,
  logger: SlonikMigrator.prettyLogger,
})

migrator.runAsCLI()