CREATE SCHEMA IF NOT EXISTS "mcos";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."abstract_part_type" (
	"abstract_part_type_id" integer PRIMARY KEY NOT NULL,
	"parent_abstract_part_type_id" integer,
	"depends_on" integer,
	"part_filename" varchar(20) DEFAULT '',
	"e_apt" varchar(100) NOT NULL,
	"g_apt" varchar(100) DEFAULT '',
	"f_apt" varchar(100) DEFAULT '',
	"s_apt" varchar(100) DEFAULT '',
	"i_apt" varchar(100) DEFAULT '',
	"j_apt" varchar(100) DEFAULT '',
	"sw_apt" varchar(100) DEFAULT '',
	"b_apt" varchar(100) DEFAULT '',
	"modified_rule" integer DEFAULT 0,
	"e_ut" text DEFAULT '',
	"g_ut" text DEFAULT '',
	"f_ut" text DEFAULT '',
	"s_ut" text DEFAULT '',
	"i_ut" text DEFAULT '',
	"j_ut" text DEFAULT '',
	"sw_ut" text DEFAULT '',
	"b_ut" text DEFAULT '',
	"part_paired" integer DEFAULT 0,
	"schematic_picname1" varchar(9) DEFAULT '',
	"schematic_picname2" varchar(9) DEFAULT 'VEH%d',
	"block_family_compatibility" integer DEFAULT 0,
	"repair_cost_modifier" numeric(100, 7) DEFAULT '1.0',
	"scrap_cost_modifier" numeric(100, 7) DEFAULT '1.0',
	"garage_category" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."attachment_point" (
	"attachment_point_id" integer PRIMARY KEY NOT NULL,
	"attachment_point" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."brand" (
	"brand_id" integer PRIMARY KEY NOT NULL,
	"brand" varchar(100),
	"pic_name" varchar(50),
	"is_stock" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."branded_part" (
	"branded_part_id" integer PRIMARY KEY NOT NULL,
	"part_type_id" integer NOT NULL,
	"model_id" integer NOT NULL,
	"mfg_date" timestamp DEFAULT '1970-01-01 00:00:00.000' NOT NULL,
	"qty_avail" integer NOT NULL,
	"retail_price" integer NOT NULL,
	"max_item_wear" smallint,
	"engine_block_family_id" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."driver_class" (
	"driver_class_id" smallint PRIMARY KEY NOT NULL,
	"driver_class" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."model" (
	"model_id" integer PRIMARY KEY NOT NULL,
	"brand_id" integer NOT NULL,
	"e_model" varchar(100),
	"g_model" varchar(100),
	"f_model" varchar(100),
	"s_model" varchar(100),
	"i_model" varchar(100),
	"j_model" varchar(100),
	"sw_model" varchar(100),
	"b_model" varchar(100),
	"e_extra_info" varchar(100),
	"g_extra_info" varchar(100),
	"f_extra_info" varchar(100),
	"s_extra_info" varchar(100),
	"i_extra_info" varchar(100),
	"j_extra_info" varchar(100),
	"sw_extra_info" varchar(100),
	"b_extra_info" varchar(100),
	"e_short_model" varchar(50),
	"g_short_model" varchar(50),
	"f_short_model" varchar(50),
	"s_short_model" varchar(50),
	"i_short_model" varchar(50),
	"j_short_model" varchar(50),
	"sw_short_model" varchar(50),
	"b_short_model" varchar(50),
	"debug_string" varchar(255),
	"debug_sort_string" varchar(50)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."part" (
	"part_id" integer PRIMARY KEY NOT NULL,
	"parent_part_id" integer,
	"branded_part_id" integer NOT NULL,
	"percent_damage" smallint NOT NULL,
	"item_wear" integer NOT NULL,
	"attachment_point_id" integer NOT NULL,
	"owner_id" integer,
	"part_name" varchar(100),
	"repair_cost" integer DEFAULT 0,
	"scrap_value" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."part_grade" (
	"part_grade_id" integer PRIMARY KEY NOT NULL,
	"e_text" varchar(50),
	"g_text" varchar(50),
	"f_text" varchar(50),
	"part_grade" varchar(50)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."part_type" (
	"part_type_id" integer PRIMARY KEY NOT NULL,
	"abstract_part_type_id" integer NOT NULL,
	"part_type" varchar(100) NOT NULL,
	"part_filename" varchar(20),
	"part_grade_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."player" (
	"player_id" integer PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"player_type_id" integer NOT NULL,
	"sanctioned_score" integer,
	"challenge_score" integer,
	"last_logged_in" timestamp,
	"times_logged_in" integer NOT NULL,
	"bank_balance" integer NOT NULL,
	"num_cars_owned" smallint NOT NULL,
	"is_logged_in" smallint,
	"driver_style" smallint NOT NULL,
	"lp_code" integer NOT NULL,
	"lp_text" varchar(9),
	"car_num_1" varchar(2) DEFAULT '' NOT NULL,
	"car_num_2" varchar(2) DEFAULT '' NOT NULL,
	"car_num_3" varchar(2) DEFAULT '' NOT NULL,
	"car_num_4" varchar(2) DEFAULT '' NOT NULL,
	"car_num_5" varchar(2) DEFAULT '' NOT NULL,
	"car_num_6" varchar(2) DEFAULT '' NOT NULL,
	"dl_number" varchar(20),
	"persona" varchar(30) NOT NULL,
	"address" varchar(128),
	"residence" varchar(20),
	"vehicle_id" integer DEFAULT 0,
	"current_race_id" integer DEFAULT 0,
	"offline_driver_skill" integer DEFAULT 0,
	"offline_grudge" integer DEFAULT 0,
	"offline_reputation" integer DEFAULT 0,
	"total_time_played" integer DEFAULT 0,
	"car_info_setting" integer DEFAULT 0,
	"stock_classic_class" smallint,
	"stock_muscle_class" smallint,
	"modified_classic_class" smallint,
	"modified_muscle_class" smallint,
	"outlaw_class" smallint,
	"drag_class" smallint,
	"challenge_rung" integer DEFAULT 0,
	"offline_ai_car_class" smallint DEFAULT 0,
	"offline_ai_skin_id" integer DEFAULT 0,
	"offline_ai_car_bpt_id" integer DEFAULT 0,
	"offline_ai_state" integer DEFAULT 0,
	"bodytype" integer DEFAULT 0,
	"skin_color" integer DEFAULT 0,
	"hair_color" integer DEFAULT 0,
	"shirt_color" integer DEFAULT 0,
	"pants_color" integer DEFAULT 0,
	"offline_driver_style" integer DEFAULT 0,
	"offline_driver_attitude" integer DEFAULT 0,
	"evaded_fuzz" integer DEFAULT 0,
	"pinks_won" integer DEFAULT 0,
	"num_unread_mail" integer DEFAULT 0,
	"total_races_run" integer DEFAULT 0,
	"total_races_won" integer DEFAULT 0,
	"total_races_completed" integer DEFAULT 0,
	"total_winnings" integer DEFAULT 0,
	"insurance_risk_points" integer DEFAULT 0,
	"insurance_rating" integer DEFAULT 0,
	"challenge_races_run" integer DEFAULT 0,
	"challenge_races_won" integer DEFAULT 0,
	"challenge_races_completed" integer DEFAULT 0,
	"cars_lost" integer DEFAULT 0,
	"cars_won" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."player_type" (
	"player_type_id" integer PRIMARY KEY NOT NULL,
	"player_type" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."profile" (
	"customer_id" integer NOT NULL,
	"profile_name" varchar(32) NOT NULL,
	"server_id" integer DEFAULT 0,
	"create_stamp" integer DEFAULT 1716559573 NOT NULL,
	"last_login_stamp" integer DEFAULT 1716559573 NOT NULL,
	"number_games" integer DEFAULT 1 NOT NULL,
	"profile_id" integer PRIMARY KEY NOT NULL,
	"is_online" boolean DEFAULT false,
	"game_purchase_stamp" integer DEFAULT 1716559573 NOT NULL,
	"game_serial_number" varchar(32),
	"time_online" integer,
	"time_in_game" integer,
	"game_blob" varchar(512),
	"personal_blob" varchar(256),
	"picture_blob" varchar(1),
	"dnd" boolean DEFAULT false,
	"game_start_stamp" integer DEFAULT 1716559573 NOT NULL,
	"current_key" varchar(400),
	"profile_level" smallint DEFAULT 0 NOT NULL,
	"shard_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."race_type" (
	"race_type_id" integer PRIMARY KEY NOT NULL,
	"race_type" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."skin" (
	"skin_id" integer PRIMARY KEY NOT NULL,
	"creator_id" integer NOT NULL,
	"skin_type_id" integer NOT NULL,
	"part_type_id" integer NOT NULL,
	"default_flag" smallint DEFAULT 0 NOT NULL,
	"e_skin" varchar(100) NOT NULL,
	"g_skin" varchar(32),
	"f_skin" varchar(32),
	"s_skin" varchar(32),
	"i_skin" varchar(32),
	"j_skin" varchar(32),
	"sw_skin" varchar(32),
	"b_skin" varchar(32),
	"price" integer NOT NULL,
	"part_filename" varchar(20),
	"h0" smallint,
	"s0" smallint,
	"v0" smallint,
	"c0" smallint,
	"x0" smallint,
	"y0" smallint,
	"h1" smallint,
	"s1" smallint,
	"v1" smallint,
	"c1" smallint,
	"x1" smallint,
	"y1" smallint,
	"h2" smallint,
	"s2" smallint,
	"v2" smallint,
	"c2" smallint,
	"x2" smallint,
	"y2" smallint,
	"h3" smallint,
	"s3" smallint,
	"v3" smallint,
	"c3" smallint,
	"x3" smallint,
	"y3" smallint,
	"h4" smallint,
	"s4" smallint,
	"v4" smallint,
	"c4" smallint,
	"x4" smallint,
	"y4" smallint,
	"h5" smallint,
	"s5" smallint,
	"v5" smallint,
	"c5" smallint,
	"x5" smallint,
	"y5" smallint,
	"h6" smallint,
	"s6" smallint,
	"v6" smallint,
	"c6" smallint,
	"x6" smallint,
	"y6" smallint,
	"h7" smallint,
	"s7" smallint,
	"v7" smallint,
	"c7" smallint,
	"x7" smallint,
	"y7" smallint,
	"creator_name" varchar(24),
	"comment_text" varchar(128)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."skin_type" (
	"skin_type_id" integer PRIMARY KEY NOT NULL,
	"skin_type" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."stock_assembly" (
	"parent_branded_part_id" integer PRIMARY KEY NOT NULL,
	"child_branded_part_id" integer NOT NULL,
	"attachment_point_id" integer NOT NULL,
	"config_default" smallint NOT NULL,
	"physics_default" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."stock_vehicle_attributes" (
	"branded_part_id" integer PRIMARY KEY NOT NULL,
	"car_class" integer NOT NULL,
	"ai_restriction_class" integer NOT NULL,
	"mode_restriction" integer NOT NULL,
	"sponsor" integer NOT NULL,
	"vin_branded_part_id" integer NOT NULL,
	"track_id" integer NOT NULL,
	"vin_crc" integer NOT NULL,
	"retail_price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."sva_car_class" (
	"sva_car_class" integer PRIMARY KEY NOT NULL,
	"description" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."sva_mode_restriction" (
	"sva_mode_restriction" integer PRIMARY KEY NOT NULL,
	"description" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."tunables" (
	"club_creation_fee" integer NOT NULL,
	"club_creation_minimum_level" integer NOT NULL,
	"club_officer_minimum_level" integer NOT NULL,
	"race_pp_defeated_opponent" integer NOT NULL,
	"race_pp_place_lost" integer NOT NULL,
	"race_penalty_per_rank" integer NOT NULL,
	"race_bonus_per_rank" integer NOT NULL,
	"race_bonus_per_mile_sponsored" integer NOT NULL,
	"race_bonus_per_mile_open" integer NOT NULL,
	"levels_tunelog" integer NOT NULL,
	"levels_slope" integer NOT NULL,
	"levels_offset" integer NOT NULL,
	"max_ez_street_level" integer NOT NULL,
	"club_wait_period_between_clubs" integer NOT NULL,
	"turfwar_caption_bonus" integer NOT NULL,
	"turfwar_member_bonus" integer NOT NULL,
	"top_dog_bonus" integer NOT NULL,
	"rank_advancement_bonus" integer NOT NULL,
	"tt_cash_reward_first" integer NOT NULL,
	"tt_cash_reward_second" integer NOT NULL,
	"tt_cash_reward_third" integer NOT NULL,
	"tt_points_reward_first" integer NOT NULL,
	"tt_points_reward_second" integer NOT NULL,
	"tt_points_reward_third" integer NOT NULL,
	"universal_repair_cost_modifier" integer NOT NULL,
	"universal_scrap_value_modifier" integer NOT NULL,
	"ad_cost_1_day" integer NOT NULL,
	"ad_cost_2_days" integer NOT NULL,
	"ad_cost_3_days" integer NOT NULL,
	"ad_cost_4_days" integer NOT NULL,
	"ad_cost_5_days" integer NOT NULL,
	"ad_cost_6_days" integer NOT NULL,
	"ad_cost_7_days" integer NOT NULL,
	"trade_in_modifier" integer NOT NULL,
	"sim_street_max_wager" integer NOT NULL,
	"point_award_1st_place" integer NOT NULL,
	"point_award_2nd_place" integer NOT NULL,
	"point_award_3rd_place" integer NOT NULL,
	"point_award_4th_place" integer NOT NULL,
	"point_award_5th_place" integer NOT NULL,
	"point_award_6th_place" integer NOT NULL,
	"arcade_race_point_modifier" integer NOT NULL,
	"mcots_pooling_frequency" integer NOT NULL,
	"starter_cash" integer NOT NULL,
	"enable_chear_emails" smallint NOT NULL,
	"salary_per_level" integer NOT NULL,
	"club_max_members" integer NOT NULL,
	"club_registration_fee" integer NOT NULL,
	"club_reregistration_fee" integer NOT NULL,
	"classified_ad_bill_rate" integer NOT NULL,
	"classified_ad_max_days" integer NOT NULL,
	"classified_ad_max_size" integer NOT NULL,
	"classified_ad_max_per_persona" integer NOT NULL,
	"pap_award_percentage" integer NOT NULL,
	"deal_of_the_day_branded_part_id" integer NOT NULL,
	"deal_of_the_day_discount" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."user" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"user_name" varchar(100) NOT NULL,
	"password" varchar(100) NOT NULL,
	"customer_id" integer NOT NULL,
	"is_super_user" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."vehicle" (
	"vehicle_id" integer PRIMARY KEY NOT NULL,
	"skin_id" integer NOT NULL,
	"flags" integer DEFAULT 0 NOT NULL,
	"class" varchar(100) NOT NULL,
	"info_setting" varchar(100) NOT NULL,
	"damage_info" "bytea"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcos"."warehouse" (
	"branded_part_id" integer NOT NULL,
	"skin_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"qty_avail" integer,
	"is_deal_of_the_day" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."abstract_part_type" ADD CONSTRAINT "abstract_part_type_parent_abstract_part_type_id_abstract_part_type_abstract_part_type_id_fk" FOREIGN KEY ("parent_abstract_part_type_id") REFERENCES "mcos"."abstract_part_type"("abstract_part_type_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."abstract_part_type" ADD CONSTRAINT "abstract_part_type_depends_on_abstract_part_type_abstract_part_type_id_fk" FOREIGN KEY ("depends_on") REFERENCES "mcos"."abstract_part_type"("abstract_part_type_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."branded_part" ADD CONSTRAINT "branded_part_part_type_id_part_type_part_type_id_fk" FOREIGN KEY ("part_type_id") REFERENCES "mcos"."part_type"("part_type_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."branded_part" ADD CONSTRAINT "branded_part_model_id_model_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "mcos"."model"("model_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."model" ADD CONSTRAINT "model_brand_id_brand_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "mcos"."brand"("brand_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."part" ADD CONSTRAINT "part_parent_part_id_part_part_id_fk" FOREIGN KEY ("parent_part_id") REFERENCES "mcos"."part"("part_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."part" ADD CONSTRAINT "part_branded_part_id_branded_part_branded_part_id_fk" FOREIGN KEY ("branded_part_id") REFERENCES "mcos"."branded_part"("branded_part_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."part" ADD CONSTRAINT "part_attachment_point_id_attachment_point_attachment_point_id_fk" FOREIGN KEY ("attachment_point_id") REFERENCES "mcos"."attachment_point"("attachment_point_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."part_type" ADD CONSTRAINT "part_type_abstract_part_type_id_abstract_part_type_abstract_part_type_id_fk" FOREIGN KEY ("abstract_part_type_id") REFERENCES "mcos"."abstract_part_type"("abstract_part_type_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."part_type" ADD CONSTRAINT "part_type_part_grade_id_part_grade_part_grade_id_fk" FOREIGN KEY ("part_grade_id") REFERENCES "mcos"."part_grade"("part_grade_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."player" ADD CONSTRAINT "player_player_type_id_player_type_player_type_id_fk" FOREIGN KEY ("player_type_id") REFERENCES "mcos"."player_type"("player_type_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."player" ADD CONSTRAINT "player_stock_muscle_class_driver_class_driver_class_id_fk" FOREIGN KEY ("stock_muscle_class") REFERENCES "mcos"."driver_class"("driver_class_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."player" ADD CONSTRAINT "player_modified_classic_class_driver_class_driver_class_id_fk" FOREIGN KEY ("modified_classic_class") REFERENCES "mcos"."driver_class"("driver_class_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."player" ADD CONSTRAINT "player_modified_muscle_class_driver_class_driver_class_id_fk" FOREIGN KEY ("modified_muscle_class") REFERENCES "mcos"."driver_class"("driver_class_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."player" ADD CONSTRAINT "player_outlaw_class_driver_class_driver_class_id_fk" FOREIGN KEY ("outlaw_class") REFERENCES "mcos"."driver_class"("driver_class_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."player" ADD CONSTRAINT "player_drag_class_driver_class_driver_class_id_fk" FOREIGN KEY ("drag_class") REFERENCES "mcos"."driver_class"("driver_class_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."skin" ADD CONSTRAINT "skin_creator_id_player_player_id_fk" FOREIGN KEY ("creator_id") REFERENCES "mcos"."player"("player_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."skin" ADD CONSTRAINT "skin_skin_type_id_skin_type_skin_type_id_fk" FOREIGN KEY ("skin_type_id") REFERENCES "mcos"."skin_type"("skin_type_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."skin" ADD CONSTRAINT "skin_part_type_id_part_type_part_type_id_fk" FOREIGN KEY ("part_type_id") REFERENCES "mcos"."part_type"("part_type_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."stock_assembly" ADD CONSTRAINT "stock_assembly_parent_branded_part_id_branded_part_branded_part_id_fk" FOREIGN KEY ("parent_branded_part_id") REFERENCES "mcos"."branded_part"("branded_part_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."stock_assembly" ADD CONSTRAINT "stock_assembly_child_branded_part_id_branded_part_branded_part_id_fk" FOREIGN KEY ("child_branded_part_id") REFERENCES "mcos"."branded_part"("branded_part_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."stock_assembly" ADD CONSTRAINT "stock_assembly_attachment_point_id_attachment_point_attachment_point_id_fk" FOREIGN KEY ("attachment_point_id") REFERENCES "mcos"."attachment_point"("attachment_point_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."stock_vehicle_attributes" ADD CONSTRAINT "stock_vehicle_attributes_branded_part_id_branded_part_branded_part_id_fk" FOREIGN KEY ("branded_part_id") REFERENCES "mcos"."branded_part"("branded_part_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."stock_vehicle_attributes" ADD CONSTRAINT "stock_vehicle_attributes_car_class_sva_car_class_sva_car_class_fk" FOREIGN KEY ("car_class") REFERENCES "mcos"."sva_car_class"("sva_car_class") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."stock_vehicle_attributes" ADD CONSTRAINT "stock_vehicle_attributes_mode_restriction_sva_mode_restriction_sva_mode_restriction_fk" FOREIGN KEY ("mode_restriction") REFERENCES "mcos"."sva_mode_restriction"("sva_mode_restriction") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."stock_vehicle_attributes" ADD CONSTRAINT "stock_vehicle_attributes_vin_branded_part_id_branded_part_branded_part_id_fk" FOREIGN KEY ("vin_branded_part_id") REFERENCES "mcos"."branded_part"("branded_part_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."vehicle" ADD CONSTRAINT "vehicle_skin_id_skin_skin_id_fk" FOREIGN KEY ("skin_id") REFERENCES "mcos"."skin"("skin_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."warehouse" ADD CONSTRAINT "warehouse_branded_part_id_branded_part_branded_part_id_fk" FOREIGN KEY ("branded_part_id") REFERENCES "mcos"."branded_part"("branded_part_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."warehouse" ADD CONSTRAINT "warehouse_skin_id_skin_skin_id_fk" FOREIGN KEY ("skin_id") REFERENCES "mcos"."skin"("skin_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mcos"."warehouse" ADD CONSTRAINT "warehouse_player_id_player_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "mcos"."player"("player_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "abstract_part_type_id_idx" ON "mcos"."abstract_part_type" ("abstract_part_type_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "parent_abstract_part_type_id_idx" ON "mcos"."abstract_part_type" ("parent_abstract_part_type_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "depends_on_idx" ON "mcos"."abstract_part_type" ("depends_on");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "attachment_point_id_idx" ON "mcos"."attachment_point" ("attachment_point_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "brand_id_idx" ON "mcos"."brand" ("brand_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "branded_part_part_id_idx" ON "mcos"."branded_part" ("part_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "branded_part_engine_block_family_id_idx" ON "mcos"."branded_part" ("engine_block_family_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "driver_class_id_idx" ON "mcos"."driver_class" ("driver_class_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "part_id_idx" ON "mcos"."part" ("part_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "part_parent_part_id_idx" ON "mcos"."part" ("parent_part_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "part_branded_part_id_idx" ON "mcos"."part" ("branded_part_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "part_attachment_point_id_idx" ON "mcos"."part" ("attachment_point_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "part_grade_id_idx" ON "mcos"."part_grade" ("part_grade_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "part_type_id_idx" ON "mcos"."part_type" ("part_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "part_type_abstract_part_type_id_idx" ON "mcos"."part_type" ("abstract_part_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "part_type_part_grade_id_idx" ON "mcos"."part_type" ("part_grade_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "player_num_unread_mail_idx" ON "mcos"."player" ("num_unread_mail");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "player_offline_ai_car_bpt_id_idx" ON "mcos"."player" ("offline_ai_car_bpt_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "player_stock_muscle_class_idx" ON "mcos"."player" ("stock_muscle_class");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "player_modified_classic_class_idx" ON "mcos"."player" ("modified_classic_class");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "player_modified_muscle_class_idx" ON "mcos"."player" ("modified_muscle_class");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "player_outlaw_class_idx" ON "mcos"."player" ("outlaw_class");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "player_drag_class_idx" ON "mcos"."player" ("drag_class");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "player_player_type_id_idx" ON "mcos"."player" ("player_type_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "player_type_id_idx" ON "mcos"."player_type" ("player_type_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "profile_id_idx" ON "mcos"."profile" ("profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "skin_id_idx" ON "mcos"."skin" ("skin_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "skin_creator_id_idx" ON "mcos"."skin" ("creator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "skin_skin_type_id_idx" ON "mcos"."skin" ("skin_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_assembly_id_idx" ON "mcos"."stock_assembly" ("parent_branded_part_id","child_branded_part_id","attachment_point_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_vehicle_attributes_branded_part_id_idx" ON "mcos"."stock_vehicle_attributes" ("branded_part_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sva_car_class_car_class_idx" ON "mcos"."sva_car_class" ("sva_car_class");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sva_mode_restriction_idx" ON "mcos"."sva_mode_restriction" ("sva_mode_restriction");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_id_idx" ON "mcos"."user" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vehicle_id_idx" ON "mcos"."vehicle" ("vehicle_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "warehouse_branded_part_id_idx" ON "mcos"."warehouse" ("branded_part_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "warehouse_skin_id_idx" ON "mcos"."warehouse" ("skin_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "warehouse_player_id_idx" ON "mcos"."warehouse" ("player_id");