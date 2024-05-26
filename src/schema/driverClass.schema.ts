import { smallint, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { pgSchema } from "drizzle-orm/pg-core";

export const mySchema = pgSchema("mcos");

export const driverClass = mySchema.table(
  "driver_class",
  {
    driverClassId: smallint("driver_class_id").notNull().primaryKey(),
    driverClass: varchar("driver_class", { length: 50 }).notNull(),
  },
  (table) => {
    return {
      idIdx: uniqueIndex("driver_class_id_idx").on(table.driverClassId),
    };
  }
);
