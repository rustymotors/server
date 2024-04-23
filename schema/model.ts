import {
    pgTable,
    varchar,
    integer,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { brand } from "./brand";

export const model = pgTable(
    "model",
    {
        modelId: integer("model_id").notNull().primaryKey(),
        brandId: integer("brand_id")
            .references(() => brand.brandId)
            .notNull(),
        eModel: varchar("e_model", { length: 100 }),
        gModel: varchar("g_model", { length: 100 }),
        fModel: varchar("f_model", { length: 100 }),
        sModel: varchar("s_model", { length: 100 }),
        iModel: varchar("i_model", { length: 100 }),
        jModel: varchar("j_model", { length: 100 }),
        swModel: varchar("sw_model", { length: 100 }),
        bModel: varchar("b_model", { length: 100 }),
        eExtraInfo: varchar("e_extra_info", { length: 100 }),
        gExtraInfo: varchar("g_extra_info", { length: 100 }),
        fExtraInfo: varchar("f_extra_info", { length: 100 }),
        sExtraInfo: varchar("s_extra_info", { length: 100 }),
        iExtraInfo: varchar("i_extra_info", { length: 100 }),
        jExtraInfo: varchar("j_extra_info", { length: 100 }),
        swExtraInfo: varchar("sw_extra_info", { length: 100 }),
        bExtraInfo: varchar("b_extra_info", { length: 100 }),
        eShortModel: varchar("e_short_model", { length: 50 }),
        gShortModel: varchar("g_short_model", { length: 50 }),
        fShortModel: varchar("f_short_model", { length: 50 }),
        sShortModel: varchar("s_short_model", { length: 50 }),
        iShortModel: varchar("i_short_model", { length: 50 }),
        jShortModel: varchar("j_short_model", { length: 50 }),
        swShortModel: varchar("sw_short_model", { length: 50 }),
        bShortModel: varchar("b_short_model", { length: 50 }),
        debug_string: varchar("debug_string", { length: 50 }),
        debug_sort_string: varchar("debug_sort_string", { length: 50 }),
    },
    (table) => {
        return {
            idIdx: uniqueIndex("model_id_idx").on(table.modelId),
        };
    },
);
