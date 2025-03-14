import { createPool, type DatabasePool, createSqlTag } from "slonik";
import { z } from "zod";

let slonik: DatabasePool;
let sql: ReturnType<typeof createSqlTag>;

function initSQL() {
    return createSqlTag({
        typeAliases: {
            vehicleWithOwner: z.object({
                vehicle_id: z.number(),
                skin_id: z.number(),
                flags: z.number(),
                class: z.number(),
                damage_info: z.instanceof(Buffer) || z.null(),
                owner_id: z.number(),
            }),
            dbPart: z.object({
                part_id: z.number(),
                parent_part_id: z.number(),
                branded_part_id: z.number(),
                percent_damage: z.number(),
                item_wear: z.number(),
                attachment_point_id: z.number(),
                owner_id: z.number(),
                part_name: z.string() || z.null(),
                repair_cost: z.number(),
                scrap_value: z.number(),
            }),
            id: z.number(),
            brandedPart: z.object({
                part_id: z.number() || z.null(),
                parent_part_id: z.number() || z.null(),
                branded_part_id: z.number() || z.null(),
                attachment_point_id: z.number() || z.null(),
            }),
            part: z.object({
                part_id: z.number(),
                parent_part_id: z.number(),
                branded_part_id: z.number(),
                percent_damage: z.number(),
                item_wear: z.number(),
                attachment_point_id: z.number(),
                part_name: z.string() || z.null(),
                owner_id: z.number(),
            }),
            abstractPartType: z.object({
                abstract_part_type_id: z.number(),
            }),
            ptSkin: z.object({
                skin_id: z.number(),
                default_flag: z.number(),
            }),
            nextPartId: z.object({
                next_val: z.bigint(),
            }),
            detailedPart: z.object({
                branded_part_id: z.number(),
                part_type_id: z.number(),
                abstract_part_type_id: z.number(),
                parent_abstract_part_type_id: z.number(),
                attachment_point_id: z.number(),
            }),
            vehicle: z.object({
                vehicle_id: z.number(),
                skin_id: z.number(),
                flags: z.number(),
                class: z.number(),
                info_setting: z.number(),
                damage_info: z.instanceof(Buffer) || z.null(),
            }),
            brand: z.object({
                brand_id: z.number(),
                brand: z.string(),
                is_stock: z.boolean(),
            }),
        },
    });
}

export async function getSlonik(): Promise<{
    slonik: DatabasePool;
    sql: ReturnType<typeof createSqlTag>;
}> {
    if (typeof process.env["DATABASE_URL"] === "undefined") {
        throw Error("Please set DATABASE_URL in your env.")
    }

    if (!slonik) {
        slonik = await createPool(process.env["DATABASE_URL"]!);
    }
    if (!sql) {
        sql = initSQL();
    }
    return { slonik, sql };
}

export async function getDatabase() {
    const { slonik, sql } = await getSlonik();
    return { slonik, sql };
}