import {
    pgTable,
    varchar,
    integer,
    uniqueIndex,
} from "drizzle-orm/pg-core";

export const playerType = pgTable(
    "player_type",
    {
        playerTypeId: integer("player_type_id").notNull().primaryKey(),
        playerType: varchar("player_type", { length: 100 }).notNull(),
    },
    (table) => {
        return {
            idIdx: uniqueIndex("player_type_id_idx").on(table.playerTypeId),
        };
    },
);
