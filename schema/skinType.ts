import {
    pgTable,
    integer,
    varchar,
} from "drizzle-orm/pg-core";

export const skinType = pgTable(
    "skin_type",
    {
        skinTypeId: integer("skin_type_id").notNull().primaryKey(),
        skinType: varchar("skin_type", { length: 100 }).notNull(),
    }
);
