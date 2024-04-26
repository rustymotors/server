import {
    pgTable,
    varchar,
    integer,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { skin } from "./skin";
import { bytea } from "./bytea";


export const vehicle = pgTable(
    "vehicle",
    {
        vehicleId: integer("vehicle_id").notNull().primaryKey(),
        skinId: integer("skin_id").references(() => skin.skinId).notNull(),
        flags: integer("flags").notNull().default(0),
        class: varchar("class", { length: 100 }).notNull(),
        infoSetting: varchar("info_setting", { length: 100 }).notNull(),
        damageInfo: bytea("damage_info"),
    },
    (table) => {
        return {
            idIdx: uniqueIndex("vehicle_id_idx").on(table.vehicleId),
        };
    });
