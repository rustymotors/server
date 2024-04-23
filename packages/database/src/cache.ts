import { Brand } from "./models/Brand.js";
import type { VehiclePartTreeType } from "./VehiclePartTree.js";
import * as Sentry from "@sentry/node";

const brandCache = new Map<string, Brand>();

export async function getBrand(brandName: string): Promise<Brand | undefined> {
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
        async () => {
            const brand = await Brand.findOne({
                where: {
                    brandName,
                },
            });

            if (!brand) {
                return undefined;
            }

            brandCache.set(brandName, brand);
            return brand;
        },
    );
}

const vehiclePartTreeCache = new Map<number, VehiclePartTreeType>();

export async function getVehiclePartTree(
    vehicleId: number,
): Promise<VehiclePartTreeType | undefined> {
    return new Promise((resolve, reject) => {
        if (vehiclePartTreeCache.has(vehicleId)) {
            resolve(vehiclePartTreeCache.get(vehicleId));
        } else {
            reject(new Error(`Vehicle part tree not found for vehicle ID ${vehicleId}`));
        }
    });
}

export async function setVehiclePartTree(
    vehicleId: number,
    vehiclePartTree: VehiclePartTreeType,
): Promise<void> {
    vehiclePartTreeCache.set(vehicleId, vehiclePartTree);
    return Promise.resolve();
}
