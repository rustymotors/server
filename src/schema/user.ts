import {
    pgTable,
    varchar,
    integer,
    uniqueIndex,
    smallint,
} from "drizzle-orm/pg-core";

export const user = pgTable(
    "user",
    {
        userId: integer("user_id").notNull().primaryKey(),
        userName: varchar("user_name", { length: 100 }).notNull(),
        password: varchar("password", { length: 100 }).notNull(),
        customerId: integer("customer_id").notNull(),
        isSuperUser: smallint("is_super_user").notNull().default(0),
    },
    (table) => {
        return {
            idIdx: uniqueIndex("user_id_idx").on(table.userId),
        };
    },
);
