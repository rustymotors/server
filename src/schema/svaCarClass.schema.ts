import { index, integer, varchar } from "drizzle-orm/pg-core";

import { pgSchema } from "drizzle-orm/pg-core";

export const mySchema = pgSchema("mcos");

export const svaCarClass = mySchema.table(
  "sva_car_class",
  {
    svaCarClass: integer("sva_car_class").notNull().primaryKey(),
    description: varchar("description", {
      length: 50,
    }).notNull(),
  },
  (table) => {
    return {
      idIdx: index("sva_car_class_car_class_idx").on(table.svaCarClass),
    };
  }
);
