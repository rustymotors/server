import { integer, smallint, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { pgSchema } from "drizzle-orm/pg-core";

export const mySchema = pgSchema("mcos");

export const brand = mySchema.table(
  "brand",
  {
    brandId: integer("brand_id").notNull().primaryKey(),
    brand: varchar("brand", { length: 100 }),
    picName: varchar("pic_name", { length: 50 }),
    isStock: smallint("is_stock").notNull(),
  },
  (table) => {
    return {
      idIdx: uniqueIndex("brand_id_idx").on(table.brandId),
    };
  }
);
