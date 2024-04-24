import {
    pgTable,
    integer,
    uniqueIndex,
    timestamp,
    smallint,
} from "drizzle-orm/pg-core";
import { partType } from "./partType";
import { model } from "./model";

export const brandedPart = pgTable(
    "branded_part",
    {
        brandedPartId: integer("branded_part_id").notNull().primaryKey(),
        partTypeId: integer("part_id").references(() => partType.partTypeId).notNull(),
        modelId: integer("model_id").references(() => model.modelId).notNull(),
        mfgDate: timestamp("mfg_date").notNull(),
        qtyAvail: integer("qty_avail").notNull(),
        retailPrice: integer("retail_price").notNull(),
        maxItemWear: smallint("max_item_wear"),
        engineBlockFamilyId: integer("engine_block_family_id").default(0),
    },
    (table) => {
        return {
            idIdx: uniqueIndex("branded_part_id_idx").on(table.brandedPartId),
            brandedPartPartTypeIdIdx: uniqueIndex("branded_part_part_id_idx").on(table.partTypeId),
            brandedPartModelIdIdx: uniqueIndex("branded_part_model_id_idx").on(table.modelId),
            brandedPartEngineBlockFamilyIdIdx: uniqueIndex("branded_part_engine_block_family_id_idx").on(table.engineBlockFamilyId),
        };
    },
);
