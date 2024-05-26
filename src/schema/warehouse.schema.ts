import { brandedPart, player, skin } from "@rustymotors/schema";
import { index, integer } from "drizzle-orm/pg-core";

import { pgSchema } from "drizzle-orm/pg-core";

export const mySchema = pgSchema("mcos");

export const warehouse = mySchema.table(
  "warehouse",
  {
    brandedPartId: integer("branded_part_id")
      .references(() => brandedPart.brandedPartId)
      .notNull(),
    skinId: integer("skin_id")
      .references(() => skin.skinId)
      .notNull(),
    playerId: integer("player_id")
      .references(() => player.playerId)
      .notNull(),
    qtyAvail: integer("qty_avail"),
    isDealOfTheDay: integer("is_deal_of_the_day").notNull().default(0),
  },
  (table) => {
    return {
      warehouseBrandedPartIdx: index("warehouse_branded_part_id_idx").on(
        table.brandedPartId
      ),
      warehouseSkinIdIdx: index("warehouse_skin_id_idx").on(table.skinId),
      warehousePlayerIdIdx: index("warehouse_player_id_idx").on(table.playerId),
    };
  }
);
