import {
    pgTable,
    integer,
    index,
    varchar,
} from "drizzle-orm/pg-core";

export const svaModeRestriction = pgTable(
    "sva_mode_restriction",
    {
        svaModeRestriction: integer("sva_mode_restriction").notNull().primaryKey(),
        description: varchar("description", {
            length: 100,
        }).notNull(),
    },
    (table) => {
        return {
            idIdx: index("sva_mode_restriction_idx").on(table.svaModeRestriction),
        };
    },
);
