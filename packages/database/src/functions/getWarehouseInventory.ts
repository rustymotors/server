import { getServerLogger } from "../../../shared";
import { getDatabase } from "../services/database";
import { warehouse as warehouseSchema } from "../../../../schema/warehouse";
import { brandedPart as brandedPartSchema } from "../../../../schema/brandedPart";
import { stockVehicleAttributes as stockVehicleAttributesSchema } from "../../../../schema/stockVehicleAttributes";
import { tunables as tunablesSchema } from "../../../../schema/tunables";
import { model as modelSchema } from "../../../../schema/model";
import { eq } from "drizzle-orm";

export type WarehouseInventory = {
    inventory: {
        brandedPartId: number;
        retailPrice: number | null;
        isDealOfTheDay: number;
    }[];
    dealOfTheDayDiscount: number;
};

export async function getWarehouseInventory(
    warehouseId: number,
    brandId: number,
): Promise<WarehouseInventory> {
    const log = getServerLogger();
    log.setName("getWarehouseInventory");

    log.debug(
        `Getting warehouse inventory for part ${brandId} in warehouse ${warehouseId}`,
    );

    let inventoryCars: {
        brandedPartId: number;
        retailPrice: number | null;
        isDealOfTheDay: number;
    }[] = [];

    const dealOfTheDayDiscount = await getDatabase()
        .select({
            dealOfTheDayBrandedPartId: brandedPartSchema.brandedPartId,
            dealOfTheDayDiscount: tunablesSchema.dealOfTheDayDiscount,
        })
        .from(tunablesSchema)
        .limit(1)
        .then((rows) => {
            return rows[0];
        });

    if (dealOfTheDayDiscount === null) {
        log.debug("Deal of the day not found");
    }

    if (brandId > 0) {
        inventoryCars = await getDatabase()
            .select({
                brandedPartId: warehouseSchema.brandedPartId,
                retailPrice: stockVehicleAttributesSchema.retailPrice,
                isDealOfTheDay: warehouseSchema.isDealOfTheDay,
            })
            .from(warehouseSchema)
            .leftJoin(
                brandedPartSchema,
                eq(
                    warehouseSchema.brandedPartId,
                    brandedPartSchema.brandedPartId,
                ),
            )
            .leftJoin(
                modelSchema,
                eq(brandedPartSchema.modelId, modelSchema.modelId),
            )

            .leftJoin(
                stockVehicleAttributesSchema,
                eq(
                    warehouseSchema.brandedPartId,
                    stockVehicleAttributesSchema.brandedPartId,
                ),
            )
            .where(
                eq(
                    eq(warehouseSchema.playerId, warehouseId),
                    eq(modelSchema.brandId, brandId),
                ),
            );
    } else {
        inventoryCars = await getDatabase()
            .select({
                brandedPartId: warehouseSchema.brandedPartId,
                retailPrice: stockVehicleAttributesSchema.retailPrice,
                isDealOfTheDay: warehouseSchema.isDealOfTheDay,
            })
            .from(warehouseSchema)
            .leftJoin(
                brandedPartSchema,
                eq(
                    warehouseSchema.brandedPartId,
                    brandedPartSchema.brandedPartId,
                ),
            )
            .where(eq(warehouseSchema.playerId, warehouseId));
    }

    const inventory = {
        inventory: inventoryCars,
        dealOfTheDayDiscount: dealOfTheDayDiscount?.dealOfTheDayDiscount ?? 0,
    };

    log.resetName();
    return inventory;
}
