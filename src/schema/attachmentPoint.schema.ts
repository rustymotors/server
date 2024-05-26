import { integer, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { pgSchema } from "drizzle-orm/pg-core";

export const mySchema = pgSchema("mcos");

export const attachmentPoint = mySchema.table(
  "attachment_point",
  {
    attachmentPointId: integer("attachment_point_id").notNull().primaryKey(),
    attachment_point: varchar("attachment_point", {
      length: 100,
    }).notNull(),
  },
  (table) => {
    return {
      idIdx: uniqueIndex("attachment_point_id_idx").on(table.attachmentPointId),
    };
  }
);
