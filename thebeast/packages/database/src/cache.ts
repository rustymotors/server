import { TBrand } from "./models/Brand.js";
import { VehiclePartTreeType } from "./models/VehiclePartTree.js";
import { createSqlTag, slonik, z } from "./services/database.js";
import * as Sentry from "@sentry/node";

const brandCache = new Map<string, TBrand>();

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
        detailedPart: z.object({
            brandedpartid: z.number(),
            parttypeid: z.number(),
            abstractparttypeid: z.number(),
            parentabstractparttypeid: z.number(),
            attachmentpointid: z.number(),
        }),
        brand: z.object({
            brandId: z.number(),
            brand: z.string(),
            isStock: z.boolean(),
        }),
    },
});

export async function getBrand(brandName: string): Promise<TBrand | undefined> {
    if (brandCache.has(brandName)) {
        return brandCache.get(brandName);
    }

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
        async (span) => {
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
