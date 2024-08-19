import { eq } from 'drizzle-orm';
import { getDatabase } from 'rusty-motors-database';
import {
    brandedPart as brandedPartSchema,
    part as partSchema,
    player as playerSchema,
    stockAssembly as stockAssemblySchema,
    stockVehicleAttributes as stockVehicleAttributesSchema,
    tunables as tunablesSchema,
    warehouse as warehouseSchema,
} from 'rusty-motors-schema';
import { getServerLogger } from 'rusty-motors-shared';
import { transferPartAssembly } from './transferPartAssembly';
/**
 * Create a new car
 *
 * This function creates a new car for a player.
 *
 * The car is created using a branded part, a skin, and a trade-in part.
 * The car is added to the player's lot and the trade-in part is removed from the player's lot.
 * The player's account is debited for the cost of the car and the trade-in value is added to the player's account.
 * The car is removed from the wholesaler's lot.
 * The transaction is committed if all operations are successful.
 * If any operation fails, the transaction is rolled back and an error is thrown.
 *
 * @param {number} lotOwnerId
 * @param {number} brandedPartId
 * @param {number} skinId
 * @param {number} playerId
 * @param {number} tradeInId
 * @returns {Promise<number>} The new car's ID
 * @throws {Error} If the lot owner ID is not found
 * @throws {Error} If the branded part ID is not found
 * @throws {Error} If the skin ID is not found
 * @throws {Error} If the player ID is not found
 * @throws {Error} If the trade-in ID is not found
 * @throws {Error} If the car is out of stock
 * @throws {Error} If the trade-in is not owned by the player
 * @throws {Error} If the trade-in value cannot be determined
 * @throws {Error} If the trade-in lot is not found
 * @throws {Error} If the trade-in can not be scrapped
 * @throws {Error} If the trade-in value can not be added to the player's account
 * @throws {Error} If the trade-in cannot be removed from the player's lot
 * @throws {Error} If the player does not have enough money to buy the car
 * @throws {Error} If the car cannot be removed from the wholesaler's lot
 * @throws {Error} If the car cannot be added to the player's lot
 * @throws {Error} If the part cannot be created
 * @throws {Error} If the vehicle cannot be created
 * @throws {Error} If the player does not have enough room in their lot
 * @throws {Error} If the sale cannot be recorded
 */
export async function createNewCar(
    lotOwnerId: number,
    brandedPartId: number,
    skinId: number,
    playerId: number,
    tradeInId: number
): Promise<number> {
    const log = getServerLogger();
    log.setName('createNewCar');

    log.debug(`Creating new car for player ${playerId}`);
    let currentAbstractCarId = 0;
    let currentPartId = 0;
    let currentParentPartId = 0;
    let currentBrandedPartId = 0;
    let currentAttachmentPointId = 0;
    let currentMaxItemWear = 0;
    let currentRetailPrice = 0;
    let scrapyardLotId = 0;
    let tradeInValue = 0;
    let cost = 0;
    let rc = 0;
    let dealOfTheDayBrandedPartId = 0;
    let dealOfTheDayDiscount = 0;
    let ownerID = 0;
    let retailPrice = 0;
    let maxItemWear = 0;
    let tradeInPartCount = 0;
    let carPartCount = 0;
    let currectPartCounter = 0;
    let carClass = 0;

    type record = {
        partId: number;
        parentPartId: number;
        brandedPartId: number;
        attachmentPointId: number;
        abstractPartTypeId: number;
        parentAbstractPartTypeId: number;
        maxItemWear: number;
        retailPrice: number;
    };

    const partRecords: record[] = [];

    const db = getDatabase();

    const parts = await db
        .select()
        .from(stockAssemblySchema)
        .where(eq(brandedPartSchema.brandedPartId, brandedPartId));

    if (parts.length === 0) {
        throw Error(`Branded part ${brandedPartId} not found`);
    }

    await db.transaction(async (tx) => {
        log.debug('Transaction started');

        let tradeInValue = 0;
        let scrapyardLotId = 0;
        let dealOfTheDayBrandedPartId: number | null = null;
        let dealOfTheDayDiscount = 0;
        let ownerID = 0;
        let retailPrice = 0;
        let maxItemWear = 0;
        let tradeInPartCount = 0;
        let carPartCount = 0;

        dealOfTheDayBrandedPartId = await tx
            .select({
                brandedPartId: warehouseSchema.brandedPartId,
            })
            .from(warehouseSchema)
            .where(eq(warehouseSchema.playerId, lotOwnerId))
            .limit(1)
            .then((result) => {
                return result[0]?.brandedPartId ?? null;
            });

        if (!dealOfTheDayBrandedPartId) {
            log.debug('Deal of the day not found');
        }

        const lotExists: boolean = await tx
            .select({
                playerID: warehouseSchema.playerId,
            })
            .from(warehouseSchema)
            .where(eq(warehouseSchema.playerId, lotOwnerId))
            .limit(1)
            .then((result) => {
                return !!result[0];
            });

        if (!lotExists) {
            tx.rollback();
            throw new Error(`Lot owner ${lotOwnerId} not found`);
        }

        if (tradeInId) {
            const validTradeIn = await tx
                .select({
                    ownerID: partSchema.ownerId,
                })
                .from(partSchema)
                .where(eq(partSchema.partId, tradeInId))
                .limit(1)
                .then((result) => {
                    return result[0]?.ownerID === playerId;
                });

            if (!validTradeIn) {
                tx.rollback();
                throw new Error(
                    `Trade-in ${tradeInId} not owned by player ${playerId}`
                );
            }

            tradeInValue = await tx
                .select({
                    scrapValue: partSchema.scrapValue,
                })
                .from(partSchema)
                .where(eq(partSchema.partId, tradeInId))
                .limit(1)
                .then((result) => {
                    return result[0]?.scrapValue ?? 0;
                });

            if (!tradeInValue) {
                tx.rollback();
                throw new Error(
                    `Trade-in value not found for part ${tradeInId}`
                );
            }

            const scrapyardLotFound = await tx
                .select({
                    playerID: warehouseSchema.playerId,
                })
                .from(warehouseSchema)
                .where(eq(warehouseSchema.playerId, scrapyardLotId))
                .then((result) => {
                    return !!result[0];
                });

            if (!scrapyardLotFound) {
                tx.rollback();
                throw new Error(`Scrapyard lot ${scrapyardLotId} not found`);
            }

            try {
                const resultOfScrap = await transferPartAssembly(
                    tradeInId,
                    scrapyardLotId
                );
            } catch (error) {
                log.error(`Error scrapping trade-in ${tradeInId}: ${error}`);
                tx.rollback();
                throw error;
            }

            // Get the owner

            const newOwner = await tx
                .select()
                .from(playerSchema)
                .where(eq(playerSchema.playerId, playerId))
                .limit(1)
                .then((result) => {
                    return result[0];
                });

            if (!newOwner) {
                log.error(`Player ${playerId} not found`);
                tx.rollback();
                throw new Error(`Player ${playerId} not found`);
            }

            const oldBankBalance = newOwner.bankBalance;

            if (oldBankBalance === null) {
                log.error(`Error getting bank balance for player ${playerId}`);
                tx.rollback();
                throw new Error(
                    `Error getting bank balance for player ${playerId}`
                );
            }

            if (tradeInValue > 0) {
                const newbankBalance = oldBankBalance + tradeInValue;
                try {
                    await tx
                        .update(playerSchema)
                        .set({
                            bankBalance: newbankBalance,
                        })
                        .where(eq(playerSchema.playerId, playerId));
                } catch (error) {
                    log.error(
                        `Error adding trade-in value to player ${playerId}: ${error}`
                    );
                    tx.rollback();
                    throw new Error(
                        `Error adding trade-in value to player ${playerId}: ${error}`
                    );
                }
            }

            // Old car trade-in complete
        }

        const result = await tx
            .select({
                carClass: stockVehicleAttributesSchema.carClass,
                retailPrice: stockVehicleAttributesSchema.retailPrice,
            })
            .from(stockVehicleAttributesSchema)
            .where(
                eq(stockVehicleAttributesSchema.brandedPartId, brandedPartId)
            )
            .limit(1);

        if (typeof result[0] === 'undefined') {
            tx.rollback();
            throw new Error(`Car ${brandedPartId} out of stock`);
        }

        carClass = result[0].carClass;
        retailPrice = result[0].retailPrice;

        if (dealOfTheDayBrandedPartId === brandedPartId) {
            dealOfTheDayDiscount = await tx
                .select({
                    discount: tunablesSchema.dealOfTheDayDiscount,
                })
                .from(tunablesSchema)
                .limit(1)
                .then((result) => {
                    return result[0]?.discount ?? 0;
                });
        }

        log.debug('Transaction committed');
    });
    log.resetName();
    return Promise.resolve(0);
}
