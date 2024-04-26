import {
    pgTable,
    integer,
    uniqueIndex,
    smallint,
    varchar,
    index,
} from "drizzle-orm/pg-core";
import { player } from "./player";
import { skinType } from "./skinType";

export const skin = pgTable(
    "skin",
    {
        skinId: integer("skin_id").notNull().primaryKey(),
        creatorId: integer("creator_id").references(() => player.playerId).notNull(),
        skinTypeId: integer("skin_type_id").references(() => skinType.skinTypeId).notNull(),
        brandedPartId: integer("branded_part_id").notNull(),
        defaultFlag: smallint("default_flag").notNull().default(0),
        eSkin: varchar("e_skin", { length: 100 }).notNull(),
        price: integer("price").notNull(),
        partFilename: varchar("part_filename", { length: 20 }).notNull(),
    },
    (table) => {
        return {
            idIdx: uniqueIndex("skin_id_idx").on(table.skinId),
            skinCreatorIdIdx: index("skin_creator_id_idx").on(table.creatorId),
            skinSkinTypeIdIdx: index("skin_skin_type_id_idx").on(table.skinTypeId),
            skinBrandedPartIdIdx: index("skin_branded_part_id_idx").on(table.brandedPartId),
        };
    },
);
