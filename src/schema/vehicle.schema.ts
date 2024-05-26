import { skin } from "@rustymotors/schema";
import { customType, integer, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { pgSchema } from "drizzle-orm/pg-core";

export const mySchema = pgSchema("mcos");

export const bytea = customType<{ data: Buffer; driverData: string }>({
  dataType() {
    return "bytea";
  },
  toDriver(value: Buffer): string {
    return `\\x${value.toString("hex")}`;
  },
  fromDriver(value: string): Buffer {
    return Buffer.from(value.slice(2), "hex");
  },
});

export const vehicle = mySchema.table(
  "vehicle",
  {
    vehicleId: integer("vehicle_id").notNull().primaryKey(),
    skinId: integer("skin_id")
      .references(() => skin.skinId)
      .notNull(),
    flags: integer("flags").notNull().default(0),
    class: varchar("class", { length: 100 }).notNull(),
    infoSetting: varchar("info_setting", { length: 100 }).notNull(),
    damageInfo: bytea("damage_info"),
  },
  (table) => {
    return {
      idIdx: uniqueIndex("vehicle_id_idx").on(table.vehicleId),
    };
  }
);
