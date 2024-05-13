import {
    pgTable,
    integer,
    smallint,
    index,
} from "drizzle-orm/pg-core";
import { brandedPart } from "./brandedPart.js";
import { attachmentPoint } from "./attachmentPoint.js";

export const stockAssembly = pgTable(
    "stock_assembly",
    {
        parentBrandedPartId: integer("parent_branded_part_id").references(() => brandedPart.brandedPartId).notNull().primaryKey(),
        childBrandedPartId: integer("child_branded_part_id").references(() => brandedPart.brandedPartId).notNull(),
        attachmentPointId: integer("attachment_point_id").references(() => attachmentPoint.attachmentPointId).notNull(),
        configDefault: smallint("config_default").notNull(),
        physicsDefault: smallint("physics_default").notNull(),
    },
    (table) => {
        return {
            idIdx: index("stock_assembly_id_idx").on(table.parentBrandedPartId, table.childBrandedPartId, table.attachmentPointId),
        };
    },
);
