import { now32 } from "@rustymotors/shared";
import {
  boolean,
  integer,
  pgTable,
  smallint,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const profile = pgTable(
  "profile",
  {
    customerId: integer("customer_id").notNull(),
    profileName: varchar("profile_name", { length: 32 }).notNull(),
    serverId: integer("server_id").default(0),
    createStamp: integer("create_stamp").notNull().default(now32()),
    lastLoginStamp: integer("last_login_stamp").notNull().default(now32()),
    numberGames: integer("number_games").notNull().default(1),
    profileId: integer("profile_id").notNull().primaryKey(),
    isOnline: boolean("is_online").default(false),
    gamePurchaseStamp: integer("game_purchase_stamp")
      .notNull()
      .default(now32()),
    gameSerialNumber: varchar("game_serial_number", { length: 32 }),
    timeOnline: integer("time_online"),
    timeInGame: integer("time_in_game"),
    gameBlob: varchar("game_blob", { length: 512 }),
    personalBlob: varchar("personal_blob", { length: 256 }),
    pictureBlob: varchar("picture_blob", { length: 1 }),
    dnd: boolean("dnd").default(false),
    gameStartStamp: integer("game_start_stamp").notNull().default(now32()),
    currentKey: varchar("current_key", { length: 400 }),
    profileLevel: smallint("profile_level").notNull().default(0),
    shardId: integer("shard_id").notNull(),
  },
  (table) => {
    return {
      idIdx: uniqueIndex("profile_id_idx").on(table.profileId),
    };
  }
);
