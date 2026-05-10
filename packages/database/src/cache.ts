import { getServerLogger, type ServerLogger } from "rusty-motors-shared";
import type { TBrand } from "./models/Brand.js";
import { getSlonik, getDatabase } from "./services/database.js";
import * as Sentry from "@sentry/node";
import type { TPart } from "./models/Part.js";
import { getDatabaseManager } from "./DatabaseManager.js";

// Lazy initialization - only connect when needed
let slonik: Awaited<ReturnType<typeof getDatabase>>["slonik"] | null = null;
let sql: Awaited<ReturnType<typeof getDatabase>>["sql"] | null = null;

async function ensureDatabase() {
    if (!slonik || !sql) {
        const db = await getDatabase();
        slonik = db.slonik;
        sql = db.sql;
    }
    return { slonik, sql };
}

const level1PartTypes = [1001, 2001, 4001, 5001, 6001, 15001, 36001, 37001];

const partNumbersMap = new Map<number, number>();

export type TVehicle = {
    vehicle_id: number;
    skin_id: number;
    flags: number;
    class: number;
    info_setting: number;
    damage_info: Buffer | null;
};

export type VehiclePartTreeType = {
    vehicleId: number;
    skinId: number;
    flags: number;
    class: number;
    infoSetting: number;
    damageInfo: Buffer | null;
    isStock: boolean;
    // One of the following two properties is required
    ownedLotId: number | null;
    ownerID: number | null;
    partId: number;
    parentPartId: null;
    brandedPartId: number;
    partTree: {
        level1: {
            partId: number;
            parts: TPart[];
        };
        level2: {
            partId: number;
            parts: TPart[];
        };
    };
};

export function vehiclePartTreeToJSON(
    vehiclePartTree: VehiclePartTreeType,
): string {
    const level1Parts = vehiclePartTree.partTree.level1.parts.map((part) => ({
        partId: part.part_id,
        parentPartId: part.parent_part_id,
        brandedPartId: part.branded_part_id,
        percentDamage: part.percent_damage,
        itemWear: part.item_wear,
        attachmentPointId: part.attachment_point_id,
        ownerId: part.owner_id,
        partName: part.part_name,
        repairCost: part.repair_cost,
        scrapValue: part.scrap_value,
    }));

    const level2Parts = vehiclePartTree.partTree.level2.parts.map((part) => ({
        partId: part.part_id,
        parentPartId: part.parent_part_id,
        brandedPartId: part.branded_part_id,
        percentDamage: part.percent_damage,
        itemWear: part.item_wear,
        attachmentPointId: part.attachment_point_id,
        ownerId: part.owner_id,
        partName: part.part_name,
        repairCost: part.repair_cost,
        scrapValue: part.scrap_value,
    }));

    return JSON.stringify({
        vehicleId: vehiclePartTree.vehicleId,
        skinId: vehiclePartTree.skinId,
        flags: vehiclePartTree.flags,
        class: vehiclePartTree.class,
        infoSetting: vehiclePartTree.infoSetting,
        damageInfo: vehiclePartTree.damageInfo,
        isStock: vehiclePartTree.isStock,
        ownedLotId: vehiclePartTree.ownedLotId,
        ownerID: vehiclePartTree.ownerID,
        partId: vehiclePartTree.partId,
        parentPartId: vehiclePartTree.parentPartId,
        brandedPartId: vehiclePartTree.brandedPartId,
        partTree: {
            level1: {
                partId: vehiclePartTree.partTree.level1.partId,
                parts: level1Parts,
            },
            level2: {
                partId: vehiclePartTree.partTree.level2.partId,
                parts: level2Parts,
            },
        },
    });
}

const brandCache = new Map<string, TBrand>();

export async function getBrand(brandName: string): Promise<TBrand | undefined> {
    if (brandCache.has(brandName)) {
        return brandCache.get(brandName);
    }

    const { slonik, sql } = await getSlonik();

    const brand = await slonik.one(sql.typeAlias("brand")`
        SELECT brandid, brand, isstock FROM brand WHERE brandname = ${brandName}
    `) as TBrand
    brandCache.set(brandName, brand);
    return brand;


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

export async function saveVehicle(
    vehiclePartTree: VehiclePartTreeType,
): Promise<void> {
    const log = getServerLogger("database/saveVehicle")
    try {
        const vehiclePart: TPart = {
            part_id: vehiclePartTree.vehicleId,
            parent_part_id: null,
            branded_part_id: vehiclePartTree.brandedPartId,
            percent_damage: 0,
            item_wear: 0,
            attachment_point_id: null,
            owner_id: vehiclePartTree.ownerID || null,
            part_name: null,
            repair_cost: 0,
            scrap_value: 0,
        };

        log.debug(`Saving vehicle part: ${JSON.stringify(vehiclePart)}`,
            { vehicleId: vehiclePartTree.vehicleId });
        await savePart(vehiclePart).catch((error) => {
            log.error(`Error saving vehicle part: ${error}`);
            const e = new Error(`Error saving vehicle part: ${error}`);
            e.cause = error;
            throw e;
        });

        const newVehicle: TVehicle = {
            vehicle_id: vehiclePartTree.vehicleId,
            skin_id: vehiclePartTree.skinId,
            flags: vehiclePartTree.flags,
            class: vehiclePartTree.class,
            info_setting: vehiclePartTree.infoSetting,
            damage_info: vehiclePartTree.damageInfo,
        };

        log.debug(`Saving vehicle: ${JSON.stringify(newVehicle)}`, {
            vehicleId: vehiclePartTree.vehicleId
        });

        await Sentry.startSpan(
            {
                name: 'Save vehicle',
                op: 'db.query',
                attributes: {
                    sql: 'INSERT INTO vehicle (vehicleid, skinid, flags, class, infosetting, damageinfo) VALUES ($1, $2, $3, $4, $5, $6)',
                    db: 'postgres',
                },
            },
            async () => {
                const { slonik, sql } = await getSlonik();
                return slonik.query(sql.typeAlias('vehicle')`
            INSERT INTO vehicle (
                vehicle_id,
                skin_id,
                flags,
                class,
                info_setting,
                damage_info
            ) VALUES (
                ${newVehicle.vehicle_id},
                ${newVehicle.skin_id},
                ${newVehicle.flags},
                ${newVehicle.class},
                ${newVehicle.info_setting},
                ${newVehicle.damage_info}
            )
        `);
            },
        ).catch((error) => {
            log.error(`Error saving vehicle(db): ${error}`);
            const e = new Error(`Error saving vehicle: ${error}`);
            e.cause = error;
            throw e;
        }
        );
    } catch (error) {
        log.error(`Error saving vehicle: ${error}`);
        throw error;
    }
}

export async function saveVehiclePartTree(
    vehiclePartTree: VehiclePartTreeType,
): Promise<void> {
    const log = getServerLogger("database/saveVehiclePartTree")
    try {
        const partIds = new Set<number>();

        const partTree = vehiclePartTree.partTree;

        for (const part of partTree.level1.parts) {
            partIds.add(part.part_id);
        }

        for (const part of partTree.level2.parts) {
            partIds.add(part.part_id);
        }

        for (const partId of partIds) {
            const part =
                partTree.level1.parts.find((p) => p.part_id === partId) ||
                partTree.level2.parts.find((p) => p.part_id === partId);
            if (!part) {
                log.error(`Part with partId ${partId} not found`);
                throw new Error(`Part with partId ${partId} not found`);
            }
            await savePart(part);
        }

        // Save the vehicle part tree in the cache
        setVehiclePartTree(vehiclePartTree.vehicleId, vehiclePartTree);
    } catch (error) {
        log.error(`Error saving vehicle part tree: ${error}`);
        throw error;
    }
}

export async function buildVehiclePartTreeFromDB(
    vehicleId: number,
): Promise<VehiclePartTreeType> {
    const log = getServerLogger("database/cache");
    const { slonik, sql } = await ensureDatabase();
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
        }
    ) as TVehicle;

    if (!vehicle) {
        log.error(`Vehicle with id ${vehicleId} does not exist`);
        throw new Error(`Vehicle with id ${vehicleId} does not exist`);
    }

    const vehiclePartTree: VehiclePartTreeType = {
        vehicleId: vehicle.vehicle_id,
        skinId: vehicle.skin_id,
        flags: vehicle.flags,
        class: vehicle.class,
        infoSetting: vehicle.info_setting,
        damageInfo: vehicle.damage_info,
        isStock: false,
        ownedLotId: null,
        ownerID: null,
        partId: vehicle.vehicle_id,
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
    const part = await slonik.one(sql.typeAlias("part")`
        SELECT part_id, parent_part_id, branded_part_id, percent_damage, item_wear, attachment_point_id, owner_id, part_name, repair_cost, scrap_value
        FROM part
        WHERE part_id = ${vehicleId}
    `) as TPart

    if (!part) {
        log.error(`Part with id ${vehicleId} does not exist`);
        throw new Error(`Part with id ${vehicleId} does not exist`);
    }

    vehiclePartTree.brandedPartId = part.branded_part_id;
    vehiclePartTree.ownerID = part.owner_id;

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

    log.debug(`We got parts!`, {
        BrandedPart: vehiclePartTree.brandedPartId
    });
    log.debug(
        `There are ${level1Parts.length} level 1 parts in the vehicle assembly`,
        { BrandedPart: vehiclePartTree.brandedPartId }
    );

    const level1PartsIds = level1Parts.map((part) => part.part_id);

    for (const part of level1Parts) {

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

    const level2Parts = await (slonik.many(sql.typeAlias("part")`
        SELECT part_id, parent_part_id, branded_part_id, percent_damage, item_wear, attachment_point_id, owner_id, part_name, repair_cost, scrap_value
        FROM part
        WHERE parent_part_id IN (${sql.join(level1PartsIds, sql.fragment`, `)})
    `) as Promise<TPart[]>);


    if (level2Parts.length === 0) {
        log.error(`Vehicle with id ${vehicleId} has no level 2 parts`);
        throw new Error(`Vehicle with id ${vehicleId} has no level 2 parts`);
    }

    log.debug(`We got parts!`,
        { BrandedPart: vehiclePartTree.brandedPartId }
    );
    log.debug(
        `There are ${level2Parts.length} level 2 parts in the vehicle assembly`,
        { BrandedPart: vehiclePartTree.brandedPartId }
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

    log.debug(`Vehicle part tree populated`,
        { BrandedPart: vehiclePartTree.brandedPartId }
    );
    log.debug(`Vehicle part tree: ${vehiclePartTreeToJSON(vehiclePartTree)}`, {
        BrandedPart: vehiclePartTree.brandedPartId
    });

    setVehiclePartTree(vehiclePartTree.vehicleId, vehiclePartTree);

    return vehiclePartTree;
}

export async function savePart(part: TPart): Promise<void> {
    await Sentry.startSpan(
        {
            name: 'Save part',
            op: 'db.query',
            attributes: {
                sql: 'INSERT INTO part (partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                db: 'postgres',
            },
        },
        async () => {
            const { slonik, sql } = await getSlonik();
            return slonik.query(sql.typeAlias('dbPart')`
        INSERT INTO part (
            part_id,
            parent_part_id,
            branded_part_id,
            percent_damage,
            item_wear,
            attachment_point_id,
            owner_id,
            part_name,
            repair_cost,
            scrap_value
        ) VALUES (
            ${part.part_id},
            ${part.parent_part_id},
            ${part.branded_part_id},
            ${part.percent_damage},
            ${part.item_wear},
            ${part.attachment_point_id},
            ${part.owner_id},
            ${part.part_name},
            ${part.repair_cost},
            ${part.scrap_value}
        )
    `);
        },
    );
}

async function getNextPartId(): Promise<number> {
    const result = await Sentry.startSpan(
        {
            name: 'Get next part id',
            op: 'db.query',
            attributes: {
                sql: "SELECT nextval('part_partid_seq')",
                db: 'postgres',
            },
        },
        async () => {
            const { slonik, sql } = await getSlonik();
            const { nextval } = await slonik.one(sql.typeAlias('nextPartId')`
            SELECT nextval('part_partid_seq')
        `) as { nextval: number };
            return Number(nextval);
        },
    );
    return result;
}

export async function buildVehiclePartTree({
    brandedPartId,
    skinId,
    ownedLotId,
    ownerID,
    isStock,
    log = getServerLogger("database/buildVehiclePartTree")
}: {
    brandedPartId: number;
    skinId: number;
    ownedLotId?: number;
    ownerID?: number;
    isStock: boolean;
    log?: ServerLogger
}): Promise<VehiclePartTreeType> {
    if (ownedLotId === undefined && ownerID === undefined) {
        log.error(`ownedLotId or ownerID is required`);
        throw new Error('ownedLotId or ownerID is required');
    }

    const skinFlags = await Sentry.startSpan(
        {
            name: 'Get skin flags',
            op: 'db.query',
            attributes: {
                sql: 'SELECT default_flag FROM pt_skin WHERE skin_id = $1',
                db: 'postgres',
            },
        },
        async () => {
            const { slonik, sql } = await getSlonik();
            return slonik.one(sql.typeAlias('ptSkin')`
        SELECT default_flag
        FROM pt_skin
        WHERE skin_id = ${skinId}
    `);
        },
    ) as { default_flag: number };

    if (!skinFlags) {
        log.error(`Skin with id ${skinId} does not exist`);
        throw new Error(`Skin with id ${skinId} does not exist`);
    }

    // Get the vehicle assembly from the database
    const { slonik, sql } = await getSlonik();
    const vehicleAssembly = await slonik.many(sql.typeAlias('detailedPart')`
        SELECT bp.branded_part_id, bp.part_type_id, a.attachment_point_id, pt.abstract_part_type_id, apt.parent_abstract_part_type_id
        FROM stock_assembly a
        INNER JOIN branded_part bp ON a.child_branded_part_id = bp.branded_part_id
        inner join part_type pt on pt.part_type_id = bp.part_type_id
        inner join abstract_part_type apt on apt.abstract_part_type_id = pt.abstract_part_type_id
        WHERE a.parent_branded_part_id = ${brandedPartId}
    `) as {
        branded_part_id: number;
        part_type_id: number;
        abstract_part_type_id: number;
        parent_abstract_part_type_id: number;
        attachment_point_id: number;
    }[];

    if (vehicleAssembly.length === 0) {
        log.error(
            `Vehicle assembly with branded part id ${brandedPartId} does not exist`,
        );
        throw new Error(
            `Vehicle assembly with branded part id ${brandedPartId}`,
        );
    }

    // But we did get parts, right?
    log.debug(`We got parts!`,
        { BrandedPart: brandedPartId }
    );
    log.debug(
        `There are ${vehicleAssembly.length} parts in the vehicle assembly`,
        { brandedPart: brandedPartId }
    );

    const topPartId = await getNextPartId();

    partNumbersMap.set(101, topPartId);

    const vehiclePartTree: VehiclePartTreeType = {
        vehicleId: topPartId,
        skinId,
        isStock,
        flags: skinFlags.default_flag,
        class: 0,
        infoSetting: 0,
        damageInfo: null,
        ownedLotId: ownedLotId || null,
        ownerID: ownerID || null,
        partId: topPartId,
        parentPartId: null,
        brandedPartId,
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

    log.debug(`Vehicle part tree created`);

    // Populate the vehicle part tree
    for (const part of vehicleAssembly) {
        const parentPartId = partNumbersMap.get(part.parent_abstract_part_type_id);

        if (parentPartId === undefined) {
            log.error(
                `parentPartId is undefined for part with parentabstractparttypeid ${part.parent_abstract_part_type_id}`,
            );
            throw new Error(
                `parentPartId is undefined for part with parentabstractparttypeid ${part.parent_abstract_part_type_id}`,
            );
        }

        const thisPartId = await getNextPartId();

        if (!partNumbersMap.has(part.abstract_part_type_id)) {
            partNumbersMap.set(part.abstract_part_type_id, thisPartId);
        }

        const newPart: TPart = {
            part_id: thisPartId,
            parent_part_id: parentPartId,
            branded_part_id: part.branded_part_id,
            percent_damage: 0,
            item_wear: 0,
            attachment_point_id: part.attachment_point_id,
            owner_id: ownerID || null,
            part_name: null,
            repair_cost: 0,
            scrap_value: 0,
        };

        const partDepth = level1PartTypes.includes(part.abstract_part_type_id)
            ? 1
            : 2;

        if (partDepth === 1) {
            vehiclePartTree.partTree.level1.parts.push(newPart);
        } else if (partDepth === 2) {
            vehiclePartTree.partTree.level2.parts.push(newPart);
        } else {
            log.error(`Part depth ${partDepth} is not supported`);
            throw new Error(`Part depth ${partDepth} is not supported`);
        }
    }

    log.debug(`Vehicle part tree populated`);

    return vehiclePartTree;
}

export async function dbBuyNewPart(personiaId: number, brandedPartId: number, _dealerId: number, _shouldChargePlayer: boolean): Promise<number> {
    const persona = getDatabaseManager().getUser(personiaId)

    if (typeof persona === "undefined") {
        throw new Error(`Persona ${personiaId} not found`)
    }

    const newPartId = await getNextPartId();

    const newPart: TPart = {
        part_id: newPartId,
        parent_part_id: null,
        branded_part_id: brandedPartId,
        percent_damage: 0,
        item_wear: 0,
        attachment_point_id: 0,
        owner_id: personiaId,
        part_name: null,
        repair_cost: 0,
        scrap_value: 0,
    }


    return savePart(newPart).then(() => newPartId)
}

export function invalidateVehiclePartTree(vehicleId: number): void {
    vehiclePartTreeCache.delete(vehicleId);
}

async function getVehicleRootId(partId: number): Promise<number | null> {
    const { slonik, sql } = await getSlonik();
    const part = await slonik.maybeOne(sql.typeAlias('part')`
        SELECT part_id, parent_part_id FROM part WHERE part_id = ${partId}
    `) as TPart | null;
    if (!part) return null;
    if (!part.parent_part_id) return part.part_id;
    const parent = await slonik.maybeOne(sql.typeAlias('part')`
        SELECT part_id, parent_part_id FROM part WHERE part_id = ${part.parent_part_id}
    `) as TPart | null;
    if (!parent) return null;
    return parent.parent_part_id ?? parent.part_id;
}

export async function dbInstallPart(
    partId: number,
    parentPartId: number,
    attachmentPointId: number,
    ownerId: number,
): Promise<void> {
    await Sentry.startSpan(
        {
            name: 'Install part',
            op: 'db.query',
            attributes: {
                sql: 'UPDATE part SET parent_part_id = $1, attachment_point_id = $2 WHERE part_id = $3 AND owner_id = $4',
                db: 'postgres',
            },
        },
        async () => {
            const { slonik, sql } = await getSlonik();
            return slonik.query(sql.typeAlias('dbPart')`
                UPDATE part
                SET parent_part_id = ${parentPartId},
                    attachment_point_id = ${attachmentPointId}
                WHERE part_id = ${partId}
                AND owner_id = ${ownerId}
            `);
        },
    );
    const vehicleId = await getVehicleRootId(parentPartId);
    if (vehicleId !== null) {
        vehiclePartTreeCache.delete(vehicleId);
    }
}

export async function dbRepairPart(
    partId: number,
    ownerId: number,
): Promise<void> {
    // TODO (bank pass): price = RetailPrice if PercentDamage >= 70, else (PercentDamage/100)*RetailPrice
    const vehicleId = await getVehicleRootId(partId);
    await Sentry.startSpan(
        {
            name: 'Repair part',
            op: 'db.query',
            attributes: {
                sql: 'UPDATE part SET percent_damage = 0 WHERE part_id = $1 AND owner_id = $2',
                db: 'postgres',
            },
        },
        async () => {
            const { slonik, sql } = await getSlonik();
            return slonik.query(sql.typeAlias('dbPart')`
                UPDATE part
                SET percent_damage = 0
                WHERE part_id = ${partId}
                AND owner_id = ${ownerId}
            `);
        },
    );
    if (vehicleId !== null) {
        vehiclePartTreeCache.delete(vehicleId);
    }
}

export async function dbRepairVehicleParts(
    vehicleId: number,
    ownerId: number,
): Promise<void> {
    // TODO (bank pass): sum repair prices across all parts (same per-part formula as dbRepairPart)
    await Sentry.startSpan(
        {
            name: 'Repair vehicle parts',
            op: 'db.query',
            attributes: {
                sql: 'UPDATE part SET percent_damage = 0 WHERE owner_id = $1 AND (part_id = $2 OR parent_part_id = $2 OR parent_part_id IN (SELECT part_id FROM part WHERE parent_part_id = $2))',
                db: 'postgres',
            },
        },
        async () => {
            const { slonik, sql } = await getSlonik();
            return slonik.query(sql.typeAlias('dbPart')`
                UPDATE part
                SET percent_damage = 0
                WHERE owner_id = ${ownerId}
                AND (
                    part_id = ${vehicleId}
                    OR parent_part_id = ${vehicleId}
                    OR parent_part_id IN (
                        SELECT part_id FROM part WHERE parent_part_id = ${vehicleId}
                    )
                )
            `);
        },
    );
    vehiclePartTreeCache.delete(vehicleId);
}

export async function dbRemovePart(
    partId: number,
    ownerId: number,
): Promise<void> {
    const vehicleId = await getVehicleRootId(partId);
    await Sentry.startSpan(
        {
            name: 'Remove part',
            op: 'db.query',
            attributes: {
                sql: 'UPDATE part SET parent_part_id = NULL, attachment_point_id = NULL WHERE part_id = $1 AND owner_id = $2',
                db: 'postgres',
            },
        },
        async () => {
            const { slonik, sql } = await getSlonik();
            return slonik.query(sql.typeAlias('dbPart')`
                UPDATE part
                SET parent_part_id = NULL,
                    attachment_point_id = NULL
                WHERE part_id = ${partId}
                AND owner_id = ${ownerId}
            `);
        },
    );
    if (vehicleId !== null) {
        vehiclePartTreeCache.delete(vehicleId);
    }
}

export async function dbDestroyPart(
    partId: number,
    ownerId: number,
): Promise<void> {
    const vehicleId = await getVehicleRootId(partId);
    await Sentry.startSpan(
        {
            name: 'Destroy part',
            op: 'db.query',
            attributes: {
                sql: 'DELETE FROM part WHERE part_id = $1 AND owner_id = $2',
                db: 'postgres',
            },
        },
        async () => {
            const { slonik, sql } = await getSlonik();
            return slonik.query(sql.typeAlias('dbPart')`
                DELETE FROM part
                WHERE part_id = ${partId}
                AND owner_id = ${ownerId}
            `);
        },
    );
    if (vehicleId !== null) {
        vehiclePartTreeCache.delete(vehicleId);
    }
}