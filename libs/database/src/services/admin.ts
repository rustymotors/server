import type { DatabaseTransactionConnection } from "slonik";
import { getSlonik } from "./database.js";
import * as Sentry from "@sentry/node";

async function playerExists(playerId: number): Promise<boolean> {
    return Sentry.startSpan(
        {
            name: "Get player",
            op: "db.query",
            description: "SELECT 1 FROM player WHERE playerid = ${playerId}",
            attributes: {
                sql: "SELECT 1 FROM player WHERE playerid = ${playerId}",
                db: "postgres",
            },
        },
        async () => {
            const { slonik, sql } = await getSlonik();
            return slonik.exists(sql.typeAlias("id")`
        SELECT 1 FROM player WHERE playerid = ${playerId}
    `);
        },
    );
}

async function skinExists(skinId: number): Promise<boolean> {
    return Sentry.startSpan(
        {
            name: "skinExists",
            op: "db.query",
            description: "SELECT 1 FROM ptskin WHERE skinid = ${skinId}",
            attributes: {
                sql: "SELECT 1 FROM ptskin WHERE skinid = ${skinId}",
                db: "postgres",
            },
        },
        async () => {
            const { slonik, sql } = await getSlonik();
            return slonik.exists(sql.typeAlias("id")`
        SELECT 1 FROM ptskin WHERE skinid = ${skinId}
    `);
        },
    );
}

async function getAbstractPartTypeIDForBrandedPartID(
    brandedPartId: number,
): Promise<number> {
    const abstractPartTypeId = await Sentry.startSpan(
        {
            name: "GetAbstractPartTypeIDForBrandedPartID",
            op: "db.query",
            description:
                "SELECT pt.abstractparttypeid FROM brandedpart bp inner join parttype pt on bp.parttypeid = pt.parttypeid WHERE bp.brandedpartid = ${brandedPartId}",
            attributes: {
                sql: "SELECT pt.abstractparttypeid FROM brandedpart bp inner join parttype pt on bp.parttypeid = pt.parttypeid WHERE bp.brandedpartid = ${brandedPartId}",
                db: "postgres",
            },
        },
        async () => {
            const { slonik, sql } = await getSlonik();
            return slonik.one(sql.typeAlias("abstractPartType")`
        SELECT pt.abstractparttypeid 
        FROM brandedpart bp
        inner join parttype pt on bp.parttypeid = pt.parttypeid
        WHERE bp.brandedpartid = ${brandedPartId}
    `);
        },
    );

    if (!abstractPartTypeId) {
        throw Error(`branded part with id ${brandedPartId} does not exist`);
    }
    return abstractPartTypeId.abstractparttypeid;
}

async function isAbstractPartTypeAVehicle(
    abstractPartTypeId: number,
): Promise<boolean> {
    return abstractPartTypeId === 101;
}

type partTableEntry = {
    partId: number | null;
    parentPartId: number | null;
    brandedPartId: number | null;
    AttachmentPointId: number | null;
};

export async function createNewCar(
    brandedPartId: number,
    skinId: number,
    newCarOwnerId: number,
): Promise<number> {
    if ((await playerExists(newCarOwnerId)) === false) {
        throw Error("player does not exist");
    }

    if ((await skinExists(skinId)) === false) {
        throw Error("skin does not exist");
    }

    const abstractPartTypeId =
        await getAbstractPartTypeIDForBrandedPartID(brandedPartId);

    console.log("abstractPartTypeId");
    console.dir(abstractPartTypeId);

    if ((await isAbstractPartTypeAVehicle(abstractPartTypeId)) === false) {
        throw Error(`branded part with id ${brandedPartId} is not a vehicle`);
    }

    const tmpParts: partTableEntry[] = [];

    tmpParts.push({
        partId: null,
        parentPartId: null,
        brandedPartId: brandedPartId,
        AttachmentPointId: 0,
    });

    // Get the rest of the parts for the vehicle
    const restOfTheParts = await Sentry.startSpan(
        {
            name: "Get rest of the parts",
            op: "db.query",
            description:
                "SELECT b.brandedpartid, a.attachmentpointid From StockAssembly a inner join brandedpart b on a.childbrandedpartid = b.brandedpartid where a.parentbrandedpartid = ${tmpParts[0].brandedPartId}",
            attributes: {
                sql: "SELECT b.brandedpartid, a.attachmentpointid From StockAssembly a inner join brandedpart b on a.childbrandedpartid = b.brandedpartid where a.parentbrandedpartid = ${tmpParts[0].brandedPartId}",
                db: "postgres",
            },
        },
        async () => {
            const { slonik, sql } = await getSlonik();
            return slonik.many(sql.typeAlias("brandedPart")`
        SELECT b.brandedpartid, a.attachmentpointid
        From StockAssembly a
        inner join brandedpart b on a.childbrandedpartid = b.brandedpartid
        where a.parentbrandedpartid = ${tmpParts[0] ? tmpParts[0].brandedPartId : null}
    `);
        },
    );

    for (const part of restOfTheParts) {
        tmpParts.push({
            partId: null,
            parentPartId: null,
            brandedPartId: part.brandedpartid,
            AttachmentPointId: part.attachmentpointid,
        });
    }

    try {
        let vehicleId = null;

        await Sentry.startSpan(
            {
                name: "Create new car",
                op: "db.transaction",
                description: "Create new car",
                attributes: {
                    db: "postgres",
                },
            },
            async () => {
                const { slonik, sql } = await getSlonik();
                slonik.transaction(async (connection) => {
                    // First insert the new car into the vehicle table

                    if (tmpParts.length === 0) {
                        throw Error(
                            `No parts for vehicle with branded part id ${brandedPartId}`,
                        );
                    }

                    let parentPartId = null;
                    let currentPartId = await getNextSq("part_partid_seq");

                    if (typeof tmpParts[0] === "undefined") {
                        throw Error("currentPartId is null");
                    }

                    // Make sure the first part's branded part id is not null
                    if (tmpParts[0].brandedPartId === null) {
                        throw Error("The first part's branded part id is null");
                    }

                    // Get the first part's abstract part type id
                    const firstPartAbstractPartTypeId =
                        await getAbstractPartTypeIDForBrandedPartID(
                            tmpParts[0].brandedPartId,
                        );

                    if (firstPartAbstractPartTypeId !== 101) {
                        throw new Error("The first part is not a vehicle");
                    }

                    // Get the skin record for the new car
                    const skinDefaultFlag = (
                        await connection.one(sql.typeAlias("ptSkin")`
                SELECT defaultflag FROM ptskin WHERE skinid = ${skinId}
            `)
                    ).defaultflag;

                    // The first part will have a parentpartid of 0, and a partid of nextval(next_part_id)
                    await addPart(
                        connection,
                        currentPartId,
                        parentPartId,
                        tmpParts[0],
                        newCarOwnerId,
                    );

                    // Insert the vehicle record
                    try {
                        await connection.query(sql.typeAlias("brandedPart")`
                    INSERT INTO vehicle (vehicleid, skinid, flags, class, infosetting, damageinfo)
                    VALUES (${currentPartId}, ${skinId}, ${skinDefaultFlag}, 0, 0, null)
                `);
                    } catch (error) {
                        console.error("Error adding vehicle: " + error);
                        throw new Error("Error adding vehicle: " + error);
                    }

                    vehicleId = currentPartId;

                    tmpParts[0].partId = currentPartId;
                    tmpParts[0].parentPartId = parentPartId;

                    // Now insert the rest of the parts
                    for (let i = 1; i < tmpParts.length; i++) {
                        parentPartId = currentPartId;
                        currentPartId = await getNextSq("part_partid_seq");
                        console.log("currentPartId");
                        console.dir(currentPartId);

                        if (typeof tmpParts[i] === "undefined") {
                            throw Error("currentPartId is null");
                        }
                        await addPart(
                            connection,
                            currentPartId,
                            parentPartId,
                            tmpParts[i] as partTableEntry,
                            newCarOwnerId,
                        );

                        // Update the partid of the part in the tmpParts array
                        (tmpParts[i] as partTableEntry).partId = currentPartId;
                        (tmpParts[i] as partTableEntry).parentPartId =
                            parentPartId;
                    }
                });
            },
        );

        if (vehicleId === null) {
            throw Error("vehicleId is null");
        }

        return vehicleId;
    } catch (error) {
        throw Error("Error creating new car: " + error);
    }
}
async function addPart(
    connection: DatabaseTransactionConnection,
    currentPartId: number,
    parentPartId: number | null,
    partEntry: partTableEntry,
    newCarOwenrId: number,
) {
    try {
        const { sql } = await getSlonik();
        await connection.query(sql.typeAlias("part")`
                    INSERT INTO part (partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue)
                    VALUES (${currentPartId}, ${parentPartId}, ${partEntry.brandedPartId}, 0, 0, ${partEntry.AttachmentPointId}, ${newCarOwenrId}, null, 0, 0)
                `);
    } catch (error) {
        throw Error("Error adding part: " + error);
    }
}

export type DBPart = {
    partId: number;
    parentPartId: number;
    brandedPartId: number;
    percentDamage: number;
    itemWear: number;
    attachmentPointId: number;
    ownerId: number;
    partName: string;
    repairCost: number;
    scrapValue: number;
};

async function getNextSq(seqName: string) {
    return await Sentry.startSpan(
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
            const { slonik, sql } = await getSlonik();
            return Number(
                (
                    await slonik.one(sql.typeAlias("nextPartId")`
                SELECT nextval(${seqName})
            `)
                ).nextval,
            );
        },
    );
}
