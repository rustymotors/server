import { getServerLogger } from "../../shared/index.js";
import * as Sentry from "@sentry/node";
import { setVehiclePartTree } from "./cache.js";
import { getDatabase } from "./services/database.js";
import { Part, type TPart } from "./models/Part.js";
import { NextPartSeq } from "./models/NextPartSeq.js";
import { Vehicle } from "./models/Vehicle.js";
import { PTSkin } from "./models/PTSkin.js";
import { StockAssembly } from "./models/StockAssembly.js";
import { BrandedPart } from "./models/BrandedPart.js";
import { PartType } from "./models/PartType.js";
import { AbstractPartType } from "./models/AbstractPartType.js";

const level1PartTypes = [1001, 2001, 4001, 5001, 6001, 15001, 36001, 37001];

const partNumbersMap = new Map<number, number>();

const log = getServerLogger();

export type TVehicle = {
    vehicleId: number;
    skinId: number;
    flags: number;
    class: number;
    infoSetting: number;
    damageInfo: Buffer | null;
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

async function getNextPartId(): Promise<number> {
    log.setName("getNextPartId");
    const result = await Sentry.startSpan(
        {
            name: "Get next part id",
            op: "db.query",
            description: "SELECT nextval('part_partid_seq')",
            attributes: {
                sql: "SELECT nextval('part_partid_seq')",
                db: "postgres",
            },
        },
        async () => {
            const nextval = await NextPartSeq.findOne({
                attributes: ["nextPartSeqId"],

            });
            return nextval;
        },        
    );

    if (!result) {
        log.error(`Error getting next part id`);
        throw new Error(`Error getting next part id`);
    }

    return result.nextPartSeqId;
}

export async function savePart(part: TPart): Promise<void> {
    log.setName("savePart");
    await Sentry.startSpan(
        {
            name: "Save part",
            op: "db.query",
            description:
                "INSERT INTO part (partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
            attributes: {
                sql: "INSERT INTO part (partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
                db: "postgres",
            },
        },
        async () => {
            await Part.create({
                partId: part.partId,
                parentPartId: part.parentPartId,
                brandedPartId: part.brandedPartId,
                percentDamage: part.percentDamage,
                itemWear: part.itemWear,
                attachmentPointId: part.attachmentPointId,
                ownerID: part.ownerID,
                partName: part.partName,
                repairCost: part.repairCost,
                scrapValue: part.scrapValue,
            });

            return;
        },
    );
}

export async function saveVehicle(
    vehiclePartTree: VehiclePartTreeType,
): Promise<void> {
    log.setName("saveVehicle");
    try {
        const vehiclePart: TPart = {
            partId: vehiclePartTree.vehicleId,
            parentPartId: null,
            brandedPartId: vehiclePartTree.brandedPartId,
            percentDamage: 0,
            itemWear: 0,
            attachmentPointId: null,
            ownerID: vehiclePartTree.ownerID || null,
            partName: null,
            repairCost: 0,
            scrapValue: 0,
        };

        log.debug(`Saving vehicle part: ${JSON.stringify(vehiclePart)}`);
        await savePart(vehiclePart);

        const newVehicle: TVehicle = {
            vehicleId: vehiclePartTree.vehicleId,
            skinId: vehiclePartTree.skinId,
            flags: vehiclePartTree.flags,
            class: vehiclePartTree.class,
            infoSetting: vehiclePartTree.infoSetting,
            damageInfo: vehiclePartTree.damageInfo,
        };

        log.debug(`Saving vehicle: ${JSON.stringify(newVehicle)}`);

        await Sentry.startSpan(
            {
                name: "Save vehicle",
                op: "db.query",
                description:
                    "INSERT INTO vehicle (vehicleid, skinid, flags, class, infosetting, damageinfo) VALUES ($1, $2, $3, $4, $5, $6)",
                attributes: {
                    sql: "INSERT INTO vehicle (vehicleid, skinid, flags, class, infosetting, damageinfo) VALUES ($1, $2, $3, $4, $5, $6)",
                    db: "postgres",
                },
            },
            async () => {

                await Vehicle.create({
                    vehicleId: newVehicle.vehicleId,
                    skinId: newVehicle.skinId,
                    flags: newVehicle.flags,
                    class: newVehicle.class,
                    infoSetting: newVehicle.infoSetting,
                    damageInfo: newVehicle.damageInfo,
                });

                return;

            },
        );
    } catch (error) {
        log.error(`Error saving vehicle: ${error as string}`);
        throw error;
    }
}

export async function saveVehiclePartTree(
    vehiclePartTree: VehiclePartTreeType,
): Promise<void> {
    log.setName("saveVehiclePartTree");
    try {
        const partIds = new Set<number>();

        const partTree = vehiclePartTree.partTree;

        for (const part of partTree.level1.parts) {
            partIds.add(part.partId);
        }

        for (const part of partTree.level2.parts) {
            partIds.add(part.partId);
        }

        for (const partId of partIds) {
            const part =
                partTree.level1.parts.find((p) => p.partId === partId) ||
                partTree.level2.parts.find((p) => p.partId === partId);
            if (!part) {
                log.error(`Part with partId ${partId} not found`);
                throw new Error(`Part with partId ${partId} not found`);
            }
            await savePart(part);
        }

        // Save the vehicle part tree in the cache
        await setVehiclePartTree(vehiclePartTree.vehicleId, vehiclePartTree);
    } catch (error) {
        log.error(`Error saving vehicle part tree: ${error as string}`);
        throw error;
    }
}

export async function buildVehiclePartTreeFromDB(
    vehicleId: number,
): Promise<VehiclePartTreeType> {
    log.setName("buildVehiclePartTreeFromDB");
    const vehicle = await Sentry.startSpan(
        {
            name: "Get vehicle",
            op: "db.query",
            description:
                "SELECT vehicleid, skinid, flags, class, infosetting, damageinfo FROM vehicle WHERE vehicleid = $1",
            attributes: {
                sql: "SELECT vehicleid, skinid, flags, class, infosetting, damageinfo FROM vehicle WHERE vehicleid = $1",
                db: "postgres",
            },
        },
        async () => {

            const vehicle = await Vehicle.findOne({
                where: {
                    vehicleId,
                },
            });

            return vehicle;
        },
    )

    if (!vehicle) {
        log.error(`Vehicle with id ${vehicleId} does not exist`);
        throw new Error(`Vehicle with id ${vehicleId} does not exist`);
    }

    const vehiclePartTree: VehiclePartTreeType = {
        vehicleId: vehicle.vehicleId,
        skinId: vehicle.skinId,
        flags: vehicle.flags,
        class: vehicle.class,
        infoSetting: vehicle.infoSetting,
        damageInfo: vehicle.damageInfo,
        isStock: false,
        ownedLotId: null,
        ownerID: null,
        partId: vehicle.vehicleId,
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
            description:
                "SELECT partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue FROM part WHERE partid = $1",
            attributes: {
                sql: "SELECT partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue FROM part WHERE partid = $1",
                db: "postgres",
            },
        },
        async () => {
            const part = await Part.findOne({
                where: {
                    partId: vehicleId,
                },
            });

            return part;
        },
    );

    if (!part) {
        log.error(`Part with id ${vehicleId} does not exist`);
        throw new Error(`Part with id ${vehicleId} does not exist`);
    }

    vehiclePartTree.brandedPartId = part.brandedPartId;
    vehiclePartTree.ownerID = part.ownerID;

    const level1Parts = await Sentry.startSpan(
        {
            name: "Get level 1 parts",
            op: "db.query",
            description:
                "SELECT partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue FROM part WHERE parentpartid = $1",
            attributes: {
                sql: "SELECT partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue FROM part WHERE parentpartid = $1",
                db: "postgres",
            },
        },
        async () => {

            const level1Parts = await Part.findAll({
                where: {
                    parentPartId: vehicleId,
                },
            });

            return level1Parts;

        },
    );

    if (level1Parts.length === 0) {
        log.error(`Vehicle with id ${vehicleId} has no parts`);
        throw new Error(`Vehicle with id ${vehicleId} has no parts`);
    }

    log.debug(`We got parts!`);
    log.debug(
        `There are ${level1Parts.length} level 1 parts in the vehicle assembly`,
    );

    const level1PartsIds = level1Parts.map((part) => part.partId);

    log.debug(`level1PartsIds: ${level1PartsIds.join(", ")}`);

    for (const part of level1Parts) {
        log.debug(
            `Adding part: ${JSON.stringify(part)} to vehicle part tree level 1`,
        );

        const newPart: TPart = {
            partId: part.partId,
            parentPartId: part.parentPartId,
            brandedPartId: part.brandedPartId,
            percentDamage: part.percentDamage,
            itemWear: part.itemWear,
            attachmentPointId: part.attachmentPointId,
            ownerID: part.ownerID,
            partName: part.partName,
            repairCost: part.repairCost,
            scrapValue: part.scrapValue,
        };

        vehiclePartTree.partTree.level1.parts.push(newPart);
    }

    const level2Parts = await Sentry.startSpan(
        {
            name: "Get level 2 parts",
            op: "db.query",
            description:
                "SELECT partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue FROM part WHERE parentpartid IN ($1)",
            attributes: {
                sql: "SELECT partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue FROM part WHERE parentpartid IN ($1)",
                db: "postgres",
            },
        },
        async () => {

            const level2Parts = await Part.findAll({
                where: {
                    parentPartId: level1PartsIds,
                },
            });

            return level2Parts;

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
            partId: part.partId,
            parentPartId: part.parentPartId,
            brandedPartId: part.brandedPartId,
            percentDamage: part.percentDamage,
            itemWear: part.itemWear,
            attachmentPointId: part.attachmentPointId,
            ownerID: part.ownerID,
            partName: part.partName,
            repairCost: part.repairCost,
            scrapValue: part.scrapValue,
        };

        vehiclePartTree.partTree.level2.parts.push(newPart);
    }

    log.debug(`Vehicle part tree populated`);
    log.debug(`Vehicle part tree: ${JSON.stringify(vehiclePartTree)}`);

    await setVehiclePartTree(vehiclePartTree.vehicleId, vehiclePartTree);

    return vehiclePartTree;
}

export async function buildVehiclePartTree({
    brandedPartId,
    skinId,
    ownedLotId,
    ownerID,
    isStock,
}: {
    brandedPartId: number;
    skinId: number;
    ownedLotId?: number;
    ownerID?: number;
    isStock: boolean;
}): Promise<VehiclePartTreeType> {
    log.setName("buildVehiclePartTree");

    const t = await getDatabase().transaction();

    if (ownedLotId === undefined && ownerID === undefined) {
        log.error(`ownedLotId or ownerID is required`);
        throw new Error("ownedLotId or ownerID is required");
    }

    const skinFlags = await Sentry.startSpan(
        {
            name: "Get skin flags",
            op: "db.query",
            description: "SELECT defaultflag FROM ptskin WHERE skinid = $1",
            attributes: {
                sql: "SELECT defaultflag FROM ptskin WHERE skinid = $1",
                db: "postgres",
            },
        },
        async () => {

            const skinFlags = PTSkin.findOne({
                where: {
                    skinId,
                },
            });

            return skinFlags;

        },
    );

    if (!skinFlags) {
        log.error(`Skin with id ${skinId} does not exist`);
        throw new Error(`Skin with id ${skinId} does not exist`);
    }

    const vehicleId = undefined;

    // Get the vehicle assembly from the database
    const vehicleAssembly = await Sentry.startSpan(
        {
            name: "Get vehicle assembly",
            op: "db.query",
            description:
                "SELECT bp.brandedpartid, bp.parttypeid, a.attachmentpointid, pt.abstractparttypeid, apt.parentabstractparttypeid FROM stockassembly a INNER JOIN brandedpart bp ON a.childbrandedpartid = bp.brandedpartid inner join parttype pt on pt.parttypeid = bp.parttypeid inner join abstractparttype apt on apt.abstractparttypeid = pt.abstractparttypeid WHERE a.parentbrandedpartid = $1",
            attributes: {
                sql: `SELECT 
                        bp.brandedpartid, bp.parttypeid, a.attachmentpointid, pt.abstractparttypeid, apt.parentabstractparttypeid 
                      FROM stockassembly a 
                      INNER JOIN brandedpart bp ON a.childbrandedpartid = bp.brandedpartid 
                      inner join parttype pt on pt.parttypeid = bp.parttypeid 
                      inner join abstractparttype apt on apt.abstractparttypeid = pt.abstractparttypeid 
                      WHERE a.parentbrandedpartid = $1`,
                db: "postgres",
            },
        },
        async () => {

            const vehicleAssembly = StockAssembly.findAll({
                where: {
                    parentBrandedPartId: brandedPartId,
                },
                include: [
                    {
                        model: BrandedPart,
                        required: true,
                        attributes: ["brandedPartId", "partTypeId"],
                        as: "childBrandedPart",
                        where: {
                            brandedPartId,
                        },
                    },
                    {
                        model: PartType,
                        required: true,
                        attributes: ["abstractPartTypeId"],
                        as: "partType",
                    },
                    {
                        model: AbstractPartType,
                        required: true,
                        attributes: ["parentAbstractPartTypeId"],
                        as: "abstractPartType",
                    },
                ],
            });

            return vehicleAssembly;

        },
    );

    if (vehicleAssembly.length === 0) {
        log.error(
            `Vehicle assembly with branded part id ${brandedPartId} does not exist`,
        );
        await t.rollback();
        throw new Error(
            `Vehicle assembly with branded part id ${brandedPartId}`,
        );
    }

    // But we did get parts, right?
    log.debug(`We got parts!`);
    log.debug(
        `There are ${vehicleAssembly.length} parts in the vehicle assembly`,
    );

    const topPartId = await getNextPartId();

    partNumbersMap.set(101, topPartId);

    const vehiclePartTree: VehiclePartTreeType = {
        vehicleId: topPartId,
        skinId,
        isStock,
        flags: skinFlags.defaultFlag,
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
    log.debug(`Vehicle part tree: ${JSON.stringify(vehiclePartTree)}`);

    // Populate the vehicle part tree
    for (const part of vehicleAssembly) {
        const parentPartId = partNumbersMap.get(part.childBrandedPartId);

        log.debug(
            `parentAbstractPartTypeId: ${part.parentabstractparttypeid}, parentPartId: ${parentPartId}`,
        );

        if (parentPartId === undefined) {
            log.error(
                `parentPartId is undefined for part with parentabstractparttypeid ${part.parentabstractparttypeid}`,
            );
            throw new Error(
                `parentPartId is undefined for part with parentabstractparttypeid ${part.parentabstractparttypeid}`,
            );
        }

        const thisPartId = await getNextPartId();

        if (!partNumbersMap.has(part.abstractparttypeid)) {
            partNumbersMap.set(part.abstractparttypeid, thisPartId);
        }

        const newPart: TPart = {
            partId: thisPartId,
            parentPartId: parentPartId,
            brandedPartId: part.brandedpartid,
            percentDamage: 0,
            itemWear: 0,
            attachmentPointId: part.attachmentpointid,
            ownerID: ownerID || null,
            partName: null,
            repairCost: 0,
            scrapValue: 0,
        };

        const partDepth = level1PartTypes.includes(part.abstractparttypeid)
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
    log.debug(`Vehicle part tree: ${JSON.stringify(vehiclePartTree)}`);
    await t.commit();
    return vehiclePartTree;
}
