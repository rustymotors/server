import {
    pgTable,
    integer,
    timestamp,
    smallint,
    index,
} from "drizzle-orm/pg-core";
import { partType } from "./partType.js";
import { model } from "./model.js";

export const brandedPart = pgTable(
    "branded_part",
    {
        brandedPartId: integer("branded_part_id").notNull().primaryKey(),
        partTypeId: integer("part_type_id").references(() => partType.partTypeId).notNull(),
        modelId: integer("model_id").references(() => model.modelId).notNull(),
        mfgDate: timestamp("mfg_date").notNull().default(new Date(0)),
        qtyAvail: integer("qty_avail").notNull(),
        retailPrice: integer("retail_price").notNull(),
        maxItemWear: smallint("max_item_wear"),
        engineBlockFamilyId: integer("engine_block_family_id").default(0),
    },
    (table) => {
        return {
            brandedPartPartTypeIdIdx: index("branded_part_part_id_idx").on(table.partTypeId),
            brandedPartEngineBlockFamilyIdIdx: index("branded_part_engine_block_family_id_idx").on(table.engineBlockFamilyId),
        };
    },
);
