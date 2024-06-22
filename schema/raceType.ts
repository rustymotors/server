import { pgTable, varchar, integer } from "drizzle-orm/pg-core";

export const raceType = pgTable('race_type', {
  raceTypeId: integer('race_type_id').notNull().primaryKey(),
  raceType: varchar('race_type', { length: 100 }).notNull(),
});
