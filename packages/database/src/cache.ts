import { getServerLogger } from "rusty-motors-shared";
import type { TBrand } from "./models/Brand.js";
import { vehiclePartTreeToJSON, type VehiclePartTreeType } from "./models/VehiclePartTree.js";
import { getSlonik, getDatabase } from "./services/database.js";
import * as Sentry from "@sentry/node";
import { TPart } from "./models/Part.js";
const { slonik, sql } = await getDatabase();

const brandCache = new Map<string, TBrand>();

export async function getBrand(brandName: string): Promise<TBrand | undefined> {
    if (brandCache.has(brandName)) {
        return brandCache.get(brandName);
    }

    return await Sentry.startSpan(
        {
            name: "Get next part id",
            op: "db.query",
            attributes: {
                sql: "SELECT nextval('part_partid_seq')",
                db: "postgres",
            },
        },
        async () => {
            const { slonik, sql } = await getSlonik();

            const brand = await slonik.one(sql.typeAlias("brand")`
        SELECT brandid, brand, isstock FROM brand WHERE brandname = ${brandName}
    `);
            brandCache.set(brandName, brand);
            return brand;
        },
    );
}

const vehiclePartTreeCache = new Map<number, VehiclePartTreeType>();

export async function getVehiclePartTree(
    vehicleId: number,
): Promise<VehiclePartTreeType | undefined> {
    if (vehiclePartTreeCache.has(vehicleId)) {
        return vehiclePartTreeCache.get(vehicleId);
    }

    return undefined;
}

export async function setVehiclePartTree(
    vehicleId: number,
    vehiclePartTree: VehiclePartTreeType,
): Promise<void> {
    vehiclePartTreeCache.set(vehicleId, vehiclePartTree);
}

export async function buildVehiclePartTreeFromDB(
    vehicleId: number,
): Promise<VehiclePartTreeType> {
    const log = getServerLogger("database/cache");
    const vehicle = await Sentry.startSpan(
        {
            name: "Get vehicle",
            op: "db.query",
            attributes: {
                sql: "SELECT vehicle_id, skin_id, flags, class, info_setting, damage_info FROM vehicle WHERE vehicle_id = $1",
                db: "postgres",
            },
        },
        async () => {
            return slonik.one(sql.typeAlias("vehicle")`
        SELECT vehicle_id, skin_id, flags, class, info_setting, damage_info
        FROM vehicle
        WHERE vehicle_id = ${vehicleId}
    `);
        },
    );

    if (!vehicle) {
        log.error(`Vehicle with id ${vehicleId} does not exist`);
        throw new Error(`Vehicle with id ${vehicleId} does not exist`);
    }

    const vehiclePartTree: VehiclePartTreeType = {
        vehicleId: vehicle.vehicleid,
        skinId: vehicle.skinid,
        flags: vehicle.flags,
        class: vehicle.class,
        infoSetting: vehicle.infosetting,
        damageInfo: vehicle.damageinfo,
        isStock: false,
        ownedLotId: null,
        ownerID: null,
        partId: vehicle.vehicleid,
        parentPartId: null,
        brandedPartId: 0,
        partTree: {
            level1: {
                partId: 0,
                parts: [],
            },
            level2: {
                partId: 0,
                parts: [],
            },
        },
    };

    // Get first part
    const part = await Sentry.startSpan(
        {
            name: "Get part",
            op: "db.query",
            attributes: {
                sql: "SELECT partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue FROM part WHERE partid = $1",
                db: "postgres",
            },
        },
        async () => {
            return slonik.one(sql.typeAlias("part")`
        SELECT part_id, parent_part_id, branded_part_id, percent_damage, item_wear, attachment_point_id, owner_id, part_name, repair_cost, scrap_value
        FROM part
        WHERE part_id = ${vehicleId}
    `);
        },
    );

    if (!part) {
        log.error(`Part with id ${vehicleId} does not exist`);
        throw new Error(`Part with id ${vehicleId} does not exist`);
    }

    vehiclePartTree.brandedPartId = part.brandedpartid;
    vehiclePartTree.ownerID = part.ownerid;

    const level1Parts = await Sentry.startSpan(
        {
            name: "Get level 1 parts",
            op: "db.query",
            attributes: {
                sql: "SELECT partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue FROM part WHERE parentpartid = $1",
                db: "postgres",
            },
        },
        async () => {
            return slonik.many(sql.typeAlias("part")`
        SELECT part_id, parent_part_id, branded_part_id, percent_damage, item_wear, attachment_point_id, owner_id, part_name, repair_cost, scrap_value
        FROM part
        WHERE parent_part_id = ${vehicleId}
    `);
        },
    ) as TPart[];

    if (level1Parts.length === 0) {
        log.error(`Vehicle with id ${vehicleId} has no parts`);
        throw new Error(`Vehicle with id ${vehicleId} has no parts`);
    }

    log.debug(`We got parts!`);
    log.debug(
        `There are ${level1Parts.length} level 1 parts in the vehicle assembly`,
    );

    log.debug(`level1Parts: ${JSON.stringify(level1Parts)}`);

    const level1PartsIds = level1Parts.map((part) => part.part_id);

    log.debug(`level1PartsIds: ${level1PartsIds}`);

    for (const part of level1Parts) {
        log.debug(
            `Adding part: ${JSON.stringify(part)} to vehicle part tree level 1`,
        );

        const newPart: TPart = {
            part_id: part.part_id,
            parent_part_id: part.parent_part_id,
            branded_part_id: part.branded_part_id,
            percent_damage: part.percent_damage,
            item_wear: part.item_wear,
            attachment_point_id: part.attachment_point_id,
            owner_id: part.owner_id,
            part_name: part.part_name,
            repair_cost: part.repair_cost,
            scrap_value: part.scrap_value,
        };

        vehiclePartTree.partTree.level1.parts.push(newPart);
    }

    const level2Parts = await Sentry.startSpan(
        {
            name: "Get level 2 parts",
            op: "db.query",
            attributes: {
                sql: "SELECT partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue FROM part WHERE parentpartid IN ($1)",
                db: "postgres",
            },
        },
        async () => {
            return slonik.many(sql.typeAlias("part")`
        SELECT part_id, parent_part_id, branded_part_id, percent_damage, item_wear, attachment_point_id, owner_id, part_name, repair_cost, scrap_value
        FROM part
        WHERE parent_part_id IN (${sql.join(level1PartsIds, sql.fragment`, `)})
    `);
        },
    );

    if (level2Parts.length === 0) {
        log.error(`Vehicle with id ${vehicleId} has no level 2 parts`);
        throw new Error(`Vehicle with id ${vehicleId} has no level 2 parts`);
    }

    log.debug(`We got parts!`);
    log.debug(
        `There are ${level2Parts.length} level 2 parts in the vehicle assembly`,
    );

    for (const part of level2Parts) {
        const newPart: TPart = {
            part_id: part.part_id,
            parent_part_id: part.parent_part_id,
            branded_part_id: part.branded_part_id,
            percent_damage: part.percent_damage,
            item_wear: part.item_wear,
            attachment_point_id: part.attachment_point_id,
            owner_id: part.owner_id,
            part_name: part.part_name,
            repair_cost: part.repair_cost,
            scrap_value: part.scrap_value,
        };

        vehiclePartTree.partTree.level2.parts.push(newPart);
    }

    log.debug(`Vehicle part tree populated`);
    log.debug(`Vehicle part tree: ${vehiclePartTreeToJSON(vehiclePartTree)}`);

    setVehiclePartTree(vehiclePartTree.vehicleId, vehiclePartTree);

    return vehiclePartTree;
}
