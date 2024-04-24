import { pgTable, varchar, integer, uniqueIndex } from "drizzle-orm/pg-core";

export const attachmentPoint = pgTable(
    "attachment_point",
    {
        attachmentPointId: integer("attachment_point_id")
            .notNull()
            .primaryKey(),
        attachment_point: varchar("attachment_point", {
            length: 100,
        }).notNull(),
    },
    (table) => {
        return {
            idIdx: uniqueIndex("attachment_point_id_idx").on(
                table.attachmentPointId,
            ),
        };
    },
);
