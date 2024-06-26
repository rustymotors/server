import {
    pgTable,
    varchar,
    integer,
    uniqueIndex,
    smallint,
} from "drizzle-orm/pg-core";

export const brand = pgTable(
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
    },
);
