import {
    pgTable,
    varchar,
    integer,
    uniqueIndex,
} from "drizzle-orm/pg-core";

export const key = pgTable(
    "user",
    {
        userId: integer("user_id").notNull().primaryKey(),
        sessionKey: varchar("session_key", { length: 100 }).notNull(),
    },
    (table) => {
        return {
            idIdx: uniqueIndex("key_user_id_idx").on(table.userId),
        };
    },
);

