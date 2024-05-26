import { integer, varchar } from "drizzle-orm/pg-core";

import { pgSchema } from "drizzle-orm/pg-core";

export const mySchema = pgSchema("mcos");

export const raceType = mySchema.table("race_type", {
  raceTypeId: integer("race_type_id").notNull().primaryKey(),
  raceType: varchar("race_type", { length: 100 }).notNull(),
});
