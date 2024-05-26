import { integer, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { pgSchema } from "drizzle-orm/pg-core";

export const mySchema = pgSchema("mcos");

export const playerType = mySchema.table(
  "player_type",
  {
    playerTypeId: integer("player_type_id").notNull().primaryKey(),
    playerType: varchar("player_type", { length: 100 }).notNull(),
  },
  (table) => {
    return {
      idIdx: uniqueIndex("player_type_id_idx").on(table.playerTypeId),
    };
  }
);
