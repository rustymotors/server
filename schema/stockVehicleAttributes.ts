import {
    pgTable,
    integer,
    index,
} from "drizzle-orm/pg-core";
import { brandedPart } from "./brandedPart";
import { svaCarClass } from "./svaCarClass";
import { svaModeRestriction } from "./svaModeRestriction";

export const stockVehicleAttributes = pgTable(
    "stock_vehicle_attributes",
    {
        brandedPartId: integer("branded_part_id").references(() => brandedPart.brandedPartId).notNull().primaryKey(),
        carClass: integer("car_class").references(() => svaCarClass.svaCarClass).notNull(),
        aiRestrictionClass: integer("ai_restriction_class").notNull(),
        modeRestriction: integer("mode_restriction").references(() => svaModeRestriction.svaModeRestriction).notNull(),
        sponsor: integer("sponsor").notNull(),
        vinBrandedPartId: integer("vin_branded_part_id").references(() => brandedPart.brandedPartId).notNull(),
        trackId: integer("track_id").notNull(),
        vinCrc: integer("vin_crc").notNull(),
        retailPrice: integer("retail_price").notNull(),
    },
    (table) => {
        return {
            idIdx: index("stock_vehicle_attributes_branded_part_id_idx").on(table.brandedPartId),
        };
    },
);
