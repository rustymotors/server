import { pgTable, uniqueIndex, index, foreignKey, integer, varchar, text, numeric, smallint } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"



export const abstractPartTypes = pgTable("abstract_part_types", {
	abstractPartTypeId: integer("abstractPartTypeId").primaryKey().notNull(),
	parentAbstractPartTypeId: integer("parentAbstractPartTypeId"),
	dependsOn: integer("dependsOn"),
	partFilename: varchar("partFilename", { length: 255 }).default(NULL::character varying),
	eapt: varchar("eapt", { length: 255 }).default(NULL::character varying),
	gapt: varchar("gapt", { length: 255 }).default(NULL::character varying),
	fapt: varchar("fapt", { length: 255 }).default(NULL::character varying),
	sapt: varchar("sapt", { length: 255 }).default(NULL::character varying),
	iapt: varchar("iapt", { length: 255 }).default(NULL::character varying),
	japt: varchar("japt", { length: 255 }).default(NULL::character varying),
	swapt: varchar("swapt", { length: 255 }).default(NULL::character varying),
	bapt: varchar("bapt", { length: 255 }).default(NULL::character varying),
	modifiedRule: integer("modifiedRule").default(0),
	eut: text("eut"),
	gut: text("gut"),
	fut: text("fut"),
	sut: text("sut"),
	iut: text("iut"),
	jut: text("jut"),
	swut: text("swut"),
	but: text("but"),
	partPared: integer("partPared").default(0),
	schematicPicname1: varchar("schematicPicname1", { length: 255 }).default(NULL::character varying),
	schematicPicname2: varchar("schematicPicname2", { length: 255 }).default(NULL::character varying),
	blockFamilyCompatibility: integer("blockFamilyCompatibility").default(0),
	repairCostModifier: numeric("repairCostModifier", { precision: 100, scale:  7 }).default('0'),
	scrapValueModifier: numeric("scrapValueModifier", { precision: 100, scale:  7 }).default('0'),
	garageCategory: integer("garageCategory").default(0),
},
(table) => {
	return {
		abstractPartTypeId: uniqueIndex("abstract_part_types_abstract_part_type_id").on(table.abstractPartTypeId),
		parentAbstractPartTypeId: index("abstract_part_types_parent_abstract_part_type_id").on(table.parentAbstractPartTypeId),
		dependsOn: index("abstract_part_types_depends_on").on(table.dependsOn),
		abstractPartTypesParentAbstractPartTypeIdFkey: foreignKey({
			columns: [table.parentAbstractPartTypeId],
			foreignColumns: [table.abstractPartTypeId],
			name: "abstract_part_types_parentAbstractPartTypeId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		abstractPartTypesDependsOnFkey: foreignKey({
			columns: [table.dependsOn],
			foreignColumns: [table.abstractPartTypeId],
			name: "abstract_part_types_dependsOn_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	}
});

export const skinTypes = pgTable("skin_types", {
	skinTypeId: smallint("skinTypeId").primaryKey().notNull(),
	skinType: varchar("skinType", { length: 255 }).notNull(),
},
(table) => {
	return {
		skinTypeId: uniqueIndex("skin_types_skin_type_id").on(table.skinTypeId),
	}
});

export const ptSkins = pgTable("pt_skins", {
	skinId: integer("skinId").primaryKey().notNull(),
	creatorId: integer("creatorId").notNull(),
	skinTypeId: smallint("skinTypeId").notNull().references(() => skinTypes.skinTypeId),
	partTypeId: integer("partTypeId").notNull().references(() => partTypes.partTypeId),
	eSkin: varchar("eSkin", { length: 255 }).notNull(),
	gSkin: varchar("gSkin", { length: 255 }).notNull(),
	fSkin: varchar("fSkin", { length: 255 }).notNull(),
	sSkin: varchar("sSkin", { length: 255 }).notNull(),
	iSkin: varchar("iSkin", { length: 255 }).notNull(),
	jSkin: varchar("jSkin", { length: 255 }).notNull(),
	swSkin: varchar("swSkin", { length: 255 }).notNull(),
	bSkin: varchar("bSkin", { length: 255 }).notNull(),
	price: integer("price").notNull(),
	partFilename: varchar("partFilename", { length: 255 }).notNull(),
	h0: smallint("h0").notNull(),
	s0: smallint("s0").notNull(),
	v0: smallint("v0").notNull(),
	c0: smallint("c0").notNull(),
	x0: smallint("x0").notNull(),
	y0: smallint("y0").notNull(),
	h1: smallint("h1").notNull(),
	s1: smallint("s1").notNull(),
	v1: smallint("v1").notNull(),
	c1: smallint("c1").notNull(),
	x1: smallint("x1").notNull(),
	y1: smallint("y1").notNull(),
	h2: smallint("h2").notNull(),
	s2: smallint("s2").notNull(),
	v2: smallint("v2").notNull(),
	c2: smallint("c2").notNull(),
	x2: smallint("x2").notNull(),
	y2: smallint("y2").notNull(),
	h3: smallint("h3").notNull(),
	s3: smallint("s3").notNull(),
	v3: smallint("v3").notNull(),
	c3: smallint("c3").notNull(),
	x3: smallint("x3").notNull(),
	y3: smallint("y3").notNull(),
	h4: smallint("h4").notNull(),
	s4: smallint("s4").notNull(),
	v4: smallint("v4").notNull(),
	c4: smallint("c4").notNull(),
	x4: smallint("x4").notNull(),
	y4: smallint("y4").notNull(),
	h5: smallint("h5").notNull(),
	s5: smallint("s5").notNull(),
	v5: smallint("v5").notNull(),
	c5: smallint("c5").notNull(),
	x5: smallint("x5").notNull(),
	y5: smallint("y5").notNull(),
	h6: smallint("h6").notNull(),
	s6: smallint("s6").notNull(),
	v6: smallint("v6").notNull(),
	c6: smallint("c6").notNull(),
	x6: smallint("x6").notNull(),
	y6: smallint("y6").notNull(),
	h7: smallint("h7").notNull(),
	s7: smallint("s7").notNull(),
	v7: smallint("v7").notNull(),
	c7: smallint("c7").notNull(),
	x7: smallint("x7").notNull(),
	y7: smallint("y7").notNull(),
	defaultFlag: integer("defaultFlag").default(0).notNull(),
	creatorName: varchar("creatorName", { length: 255 }).notNull(),
	commentText: varchar("commentText", { length: 255 }).notNull(),
},
(table) => {
	return {
		skinId: uniqueIndex("pt_skins_skin_id").on(table.skinId),
		partTypeId: index("pt_skins_part_type_id").on(table.partTypeId),
		skinTypeId: index("pt_skins_skin_type_id").on(table.skinTypeId),
	}
});

export const partTypes = pgTable("part_types", {
	partTypeId: integer("partTypeId").primaryKey().notNull(),
	abstractPartTypeId: integer("abstractPartTypeId").references(() => abstractPartTypes.abstractPartTypeId),
	partGradeId: integer("partGradeId").references(() => partGrades.partGradeId),
	partType: varchar("partType", { length: 255 }).default(NULL::character varying),
	partFilename: varchar("partFilename", { length: 255 }).default(NULL::character varying),
},
(table) => {
	return {
		partTypeId: uniqueIndex("part_types_part_type_id").on(table.partTypeId),
	}
});

export const partGrades = pgTable("part_grades", {
	partGradeId: integer("partGradeId").primaryKey().notNull(),
	eText: varchar("eText", { length: 255 }).default(NULL::character varying),
	gText: varchar("gText", { length: 255 }).default(NULL::character varying),
	fText: varchar("fText", { length: 255 }).default(NULL::character varying),
	partGrade: varchar("partGrade", { length: 255 }).default(NULL::character varying),
},
(table) => {
	return {
		partGradeId: uniqueIndex("part_grades_part_grade_id").on(table.partGradeId),
	}
});