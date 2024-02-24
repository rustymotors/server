import { DatabaseTransactionConnection } from "slonik";
import { slonik, createSqlTag, z } from "./database.js";
import { log } from "../../../shared/log.js";

async function playerExists(playerId: number): Promise<boolean> {
    return await slonik.exists(sql.typeAlias("id")`
        SELECT 1 FROM player WHERE playerid = ${playerId}
    `);
}

async function skinExists(skinId: number): Promise<boolean> {
    return await slonik.exists(sql.typeAlias("id")`
        SELECT 1 FROM ptskin WHERE skinid = ${skinId}
    `);
}

const sql = createSqlTag({
    typeAliases: {
        id: z.number(),
        brandedPart: z.object({
            partid: z.number() || z.null(),
            parentpartid: z.number() || z.null(),
            brandedpartid: z.number() || z.null(),
            attachmentpointid: z.number() || z.null(),
        }),
        part: z.object({
            partid: z.number(),
            parentpartid: z.number(),
            brandedpartid: z.number(),
            percentdamage: z.number(),
            itemwear: z.number(),
            attachmentpointid: z.number(),
            partname: z.string() || z.null(),
            ownerid: z.number(),
        }),
        abstractPartType: z.object({
            abstractparttypeid: z.number(),
        }),
        ptSkin: z.object({
            skinid: z.number(),
            defaultflag: z.number(),
        }),
        nextPartId: z.object({
            nextval: z.bigint(),
        }),
        dbPart: z.object({
            partid: z.number(),
            parentpartid: z.number(),
            brandedpartid: z.number(),
            percentdamage: z.number(),
            itemwear: z.number(),
            attachmentpointid: z.number(),
            ownerid: z.number(),
            partname: z.string() || z.null(),
            repaircost: z.number(),
            scrapvalue: z.number(),
        }),
    },
});

async function getAbstractPartTypeIDForBrandedPartID(
    brandedPartId: number,
): Promise<number> {
    const abstractPartTypeId = await slonik.one(sql.typeAlias(
        "abstractPartType",
    )`
        SELECT pt.abstractparttypeid 
        FROM brandedpart bp
        inner join parttype pt on bp.parttypeid = pt.parttypeid
        WHERE bp.brandedpartid = ${brandedPartId}
    `);
    if (!abstractPartTypeId) {
        log.error(`branded part with id ${brandedPartId} does not exist`);
        throw new Error(`branded part with id ${brandedPartId} does not exist`);
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
    if (!playerExists(newCarOwnerId)) {
        log.error("player does not exist");
        throw new Error("player does not exist");
    }

    if (!skinExists(skinId)) {
        log.error("skin does not exist");
        throw new Error("skin does not exist");
    }

    const abstractPartTypeId =
        await getAbstractPartTypeIDForBrandedPartID(brandedPartId);

    console.log("abstractPartTypeId");
    console.dir(abstractPartTypeId);

    if (!isAbstractPartTypeAVehicle(abstractPartTypeId)) {
        log.error(`branded part with id ${brandedPartId} is not a vehicle`);
        throw new Error(
            `branded part with id ${brandedPartId} is not a vehicle`,
        );
    }

    const tmpParts: partTableEntry[] = [];

    tmpParts.push({
        partId: null,
        parentPartId: null,
        brandedPartId: brandedPartId,
        AttachmentPointId: 0,
    });

    // Get the rest of the parts for the vehicle
    const restOfTheParts = await slonik.many(sql.typeAlias("brandedPart")`
        SELECT b.brandedpartid, a.attachmentpointid
        From StockAssembly a
        inner join brandedpart b on a.childbrandedpartid = b.brandedpartid
        where a.parentbrandedpartid = ${tmpParts[0].brandedPartId}
    `);

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

        await slonik.transaction(async (connection) => {
            // First insert the new car into the vehicle table

            if (tmpParts.length === 0) {
                log.error(`No parts found for the vehicle ${brandedPartId}`);
                throw new Error("No parts found for the vehicle");
            }

            let parentPartId = null;
            let currentPartId = await getNextSq("part_partid_seq");

            // Make sure the first part's branded part id is not null
            if (tmpParts[0].brandedPartId === null) {
                log.error("The first part's branded part id is null");
                throw new Error("The first part's branded part id is null");
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

                await addPart(
                    connection,
                    currentPartId,
                    parentPartId,
                    tmpParts[i],
                    newCarOwnerId,
                );

                // Update the partid of the part in the tmpParts array
                tmpParts[i].partId = currentPartId;
                tmpParts[i].parentPartId = parentPartId;
            }
        });

        if (vehicleId === null) {
            log.error("vehicleId is null");
            throw new Error("vehicleId is null");
        }

        return vehicleId;
    } catch (error) {
        log.error("Error creating new car: " + error);
        throw new Error("Error creating new car: " + error);
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
        await connection.query(sql.typeAlias("part")`
                    INSERT INTO part (partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue)
                    VALUES (${currentPartId}, ${parentPartId}, ${partEntry.brandedPartId}, 0, 0, ${partEntry.AttachmentPointId}, ${newCarOwenrId}, null, 0, 0)
                `);
    } catch (error) {
        log.error("Error adding part: " + error);
        throw new Error("Error adding part: " + error);
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

async function getPart(
    connection: DatabaseTransactionConnection,
    requestedPartId: number,
): Promise<DBPart> {
    try {
        const part = await connection.one(sql.typeAlias("dbPart")`
                    SELECT FROM part (partid, parentpartid, brandedpartid, percentdamage, itemwear, attachmentpointid, ownerid, partname, repaircost, scrapvalue)
                    WHERE partid = ${requestedPartId}
                `);
        return {
            partId: part.partid,
            parentPartId: part.parentpartid,
            brandedPartId: part.brandedpartid,
            percentDamage: part.percentdamage,
            itemWear: part.itemwear,
            attachmentPointId: part.attachmentpointid,
            ownerId: part.ownerid,
            partName: part.partname,
            repairCost: part.repaircost,
            scrapValue: part.scrapvalue,
        };
    } catch (error) {
        log.error("Error getting part: " + error);
        throw new Error("Error adding part: " + error);
    }
}

async function getNextSq(seqName: string) {
    return Number(
        (
            await slonik.one(sql.typeAlias("nextPartId")`
                SELECT nextval(${seqName})
            `)
        ).nextval,
    );
}
