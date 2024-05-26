import { integer, varchar } from "drizzle-orm/pg-core";

import { pgSchema } from "drizzle-orm/pg-core";

export const mySchema = pgSchema("mcos");

export const skinType = mySchema.table("skin_type", {
  skinTypeId: integer("skin_type_id").notNull().primaryKey(),
  skinType: varchar("skin_type", { length: 100 }).notNull(),
});
