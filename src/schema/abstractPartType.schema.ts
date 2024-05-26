import {
  integer,
  numeric,
  text,
  uniqueIndex,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

import { pgSchema } from "drizzle-orm/pg-core";

export const mySchema = pgSchema("mcos");

export const abstractPartType = mySchema.table(
  "abstract_part_type",
  {
    abstractPartTypeId: integer("abstract_part_type_id").notNull().primaryKey(),
    parentAbstractPartTypeId: integer(
      "parent_abstract_part_type_id"
    ).references((): AnyPgColumn => abstractPartType.abstractPartTypeId),
    dependsOn: integer("depends_on").references(
      (): AnyPgColumn => abstractPartType.abstractPartTypeId
    ),
    partFilename: varchar("part_filename", { length: 20 }).default(""),
    eAPT: varchar("e_apt", { length: 100 }).notNull(),
    gAPT: varchar("g_apt", { length: 100 }).default(""),
    fAPT: varchar("f_apt", { length: 100 }).default(""),
    sAPT: varchar("s_apt", { length: 100 }).default(""),
    iAPT: varchar("i_apt", { length: 100 }).default(""),
    jAPT: varchar("j_apt", { length: 100 }).default(""),
    swAPT: varchar("sw_apt", { length: 100 }).default(""),
    bAPT: varchar("b_apt", { length: 100 }).default(""),
    modifiedRule: integer("modified_rule").default(0),
    eUT: text("e_ut").default(""),
    gUT: text("g_ut").default(""),
    fUT: text("f_ut").default(""),
    sUT: text("s_ut").default(""),
    iUT: text("i_ut").default(""),
    jUT: text("j_ut").default(""),
    swUT: text("sw_ut").default(""),
    bUT: text("b_ut").default(""),
    partPaired: integer("part_paired").default(0),
    schematicPicname1: varchar("schematic_picname1", { length: 9 }).default(""),
    schematicPicname2: varchar("schematic_picname2", { length: 9 }).default(
      "VEH%d"
    ),
    blockFamilyCompatibility: integer("block_family_compatibility").default(0),
    repairCostModifier: numeric("repair_cost_modifier", {
      precision: 100,
      scale: 7,
    }).default("1.0"),
    scrapCostModifier: numeric("scrap_cost_modifier", {
      precision: 100,
      scale: 7,
    }).default("1.0"),
    garageCategory: integer("garage_category").default(0),
  },
  (table) => {
    return {
      idIdx: uniqueIndex("abstract_part_type_id_idx").on(
        table.abstractPartTypeId
      ),
      parentAbstractPartTypeIdIdx: uniqueIndex(
        "parent_abstract_part_type_id_idx"
      ).on(table.parentAbstractPartTypeId),
      dependsOnIdx: uniqueIndex("depends_on_idx").on(table.dependsOn),
    };
  }
);
