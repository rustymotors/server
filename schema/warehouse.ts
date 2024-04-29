import {
    pgTable,
    integer,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { player } from "./player";
import { brandedPart } from "./brandedPart";
import { skin } from "./skin";

export const warehouse = pgTable(
    "warehouse",
    {
        brandedPartId: integer("branded_part_id").references(() => brandedPart.brandedPartId).notNull(),
        skinId: integer("skin_id").references(() => skin.skinId).notNull(),
        playerId: integer("player_id").references(() => player.playerId).notNull().primaryKey(),
        qtyAvail: integer("qty_avail"),
        isDealOfTheDay: integer("is_deal_of_the_day").notNull().default(0),
    },
    (table) => {
        return {
            warehouseBrandedPartIdx: uniqueIndex("warehouse_branded_part_id_idx").on(table.brandedPartId),
            warehouseSkinIdIdx: uniqueIndex("warehouse_skin_id_idx").on(table.skinId),
            warehousePlayerIdIdx: uniqueIndex("warehouse_player_id_idx").on(table.playerId),
        };
    },
);
