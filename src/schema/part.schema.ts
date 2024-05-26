import { attachmentPoint, brandedPart } from "@rustymotors/schema";
import {
  index,
  integer,
  smallint,
  uniqueIndex,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

import { pgSchema } from "drizzle-orm/pg-core";

export const mySchema = pgSchema("mcos");

export const part = mySchema.table(
  "part",
  {
    partId: integer("part_id").notNull().primaryKey(),
    parentPartId: integer("parent_part_id").references(
      (): AnyPgColumn => part.partId
    ),
    brandedPartId: integer("branded_part_id")
      .notNull()
      .references(() => brandedPart.brandedPartId),
    percentDamage: smallint("percent_damage").notNull(),
    itemWear: integer("item_wear").notNull(),
    attachmentPointId: integer("attachment_point_id")
      .notNull()
      .references(() => attachmentPoint.attachmentPointId),
    ownerId: integer("owner_id"),
    partName: varchar("part_name", { length: 100 }),
    repairCost: integer("repair_cost").default(0),
    scrapValue: integer("scrap_value").default(0),
  },
  (table) => {
    return {
      idIdx: uniqueIndex("part_id_idx").on(table.partId),
      partParentPartIdIdx: index("part_parent_part_id_idx").on(
        table.parentPartId
      ),
      partBrandedPartIdIdx: index("part_branded_part_id_idx").on(
        table.brandedPartId
      ),
      partAttachmentPointIdIdx: index("part_attachment_point_id_idx").on(
        table.attachmentPointId
      ),
    };
  }
);
