import {
    pgTable,
    varchar,
    integer,
    uniqueIndex,
    index,
} from "drizzle-orm/pg-core";
import { abstractPartType } from "./abstractPartType";
import { partGrade } from "./partGrade";

export const partType = pgTable(
    "part_type",
    {
        partTypeId: integer("part_type_id").notNull().primaryKey(),
        abstractPartTypeId: integer("abstract_part_type_id").notNull().references(() => abstractPartType.abstractPartTypeId).notNull(),
        partType: varchar("part_type", { length: 100 }).notNull(),
        partFilename: varchar("part_filename", { length: 20 }),
        partGradeId: integer("part_grade_id").notNull().references(() => partGrade.partGradeId),
    },
    (table) => {
        return {
            partTypeIdIdx: uniqueIndex("part_type_id_idx").on(table.partTypeId),
            partTypeAbstractPartTypeIdIdx: index("part_type_abstract_part_type_id_idx").on(table.abstractPartTypeId),
            partTypePartGradeIdIdx: index("part_type_part_grade_id_idx").on(table.partGradeId),
        };
    },
);
