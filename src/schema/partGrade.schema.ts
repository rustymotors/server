import { integer, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { pgSchema } from "drizzle-orm/pg-core";

export const mySchema = pgSchema("mcos");

export const partGrade = mySchema.table(
  "part_grade",
  {
    partGradeId: integer("part_grade_id").notNull().primaryKey(),
    eText: varchar("e_text", { length: 50 }),
    gText: varchar("g_text", { length: 50 }),
    fText: varchar("f_text", { length: 50 }),
    partGrade: varchar("part_grade", { length: 50 }),
  },
  (table) => {
    return {
      idIdx: uniqueIndex("part_grade_id_idx").on(table.partGradeId),
    };
  }
);
