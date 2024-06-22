import {
    pgTable,
    integer,
    index,
    varchar,
} from "drizzle-orm/pg-core";

export const svaCarClass = pgTable(
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
    },
);
