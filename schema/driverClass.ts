import {
    pgTable,
    varchar,
    uniqueIndex,
    smallint,
} from "drizzle-orm/pg-core";

export const driverClass = pgTable(
    "driver_class",
    {
        driverClassId: smallint("driver_class_id").notNull().primaryKey(),
        driverClass: varchar("driver_class", { length: 50 }).notNull(),
    },
    (table) => {
        return {
            idIdx: uniqueIndex("driver_class_id_idx").on(table.driverClassId),
        };
    },
);
