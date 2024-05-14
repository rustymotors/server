import {
    pgTable,
    integer,
    index,
} from "drizzle-orm/pg-core";
import { player } from "./player.js";
import { brandedPart } from "./brandedPart.js";
import { skin } from "./skin.js";

export const warehouse = pgTable(
    "warehouse",
    {
        brandedPartId: integer("branded_part_id").references(() => brandedPart.brandedPartId).notNull(),
        skinId: integer("skin_id").references(() => skin.skinId).notNull(),
        playerId: integer("player_id").references(() => player.playerId).notNull(),
        qtyAvail: integer("qty_avail"),
        isDealOfTheDay: integer("is_deal_of_the_day").notNull().default(0),
    },
    (table) => {
        return {
            warehouseBrandedPartIdx: index("warehouse_branded_part_id_idx").on(table.brandedPartId),
            warehouseSkinIdIdx: index("warehouse_skin_id_idx").on(table.skinId),
            warehousePlayerIdIdx: index("warehouse_player_id_idx").on(table.playerId),
        };
    },
);
