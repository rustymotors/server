import { getServerLogger } from "@rustymotors/shared";
import { StockAssembly } from "../models/StockAssembly";
import { BrandedPart } from "../models/BrandedPart";
import { getDatabase } from "../services/database";
import { Warehouse } from "../models/Warehouse";
import { Part } from "../models/Part";
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
    tradeInId: number,
): Promise<number> {
    const log = getServerLogger();
    log.setName("createNewCar");

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
        partId: number,
        parentPartId: number,
        brandedPartId: number,
        attachmentPointId: number,
        abstractPartTypeId: number,
        parentAbstractPartTypeId: number,
        maxItemWear: number,
        retailPrice: number,
    };

    const partRecords: record[] = [];

    const parts = await StockAssembly.findAll({
        attributes: [
            ["childBrandedPart.brandedPartId", "brandedPartId"],
            "attachmentPointId",
            "abstractPartTypeId",
            "parentAbstractPartTypeId",
            "retailPrice",
            "maxItemWear",
        ],
        where: {
            $parentBrandedPartId$: brandedPartId,
        },
        include: [
            {
                model: BrandedPart,
                as: "childBrandedPart",
                attributes: [
                    "brandedPartId",
                ],
            },
        ],
    });

    if (parts.length === 0) {
        throw Error(`Branded part ${brandedPartId} not found`);
    }

    await getDatabase().transaction(async (transaction) => {
        log.debug("Transaction started");

        let tradeInValue = 0;
        let scrapyardLotId = 0;
        let dealOfTheDayBrandedPartId: number | null = null
        let dealOfTheDayDiscount = 0;
        let ownerID = 0;
        let retailPrice = 0;
        let maxItemWear = 0;
        let tradeInPartCount = 0;
        let carPartCount = 0;

        dealOfTheDayBrandedPartId = await Warehouse.findOne({
            attributes: ["brandedPartId"],
            where: {
                playerID: lotOwnerId,
            },
            transaction,
        }).then((dealOfTheDay) => dealOfTheDay?.brandedPartId ?? null);        

        if (!dealOfTheDayBrandedPartId) {
            log.debug("Deal of the day not found");
        }

        const lotExists: boolean = await Warehouse.findOne({
            attributes: ["playerID"],
            where: {
                playerID: lotOwnerId,
            },
            transaction,
        }).then((lot) => !!lot);

        if (!lotExists) {
            await transaction.rollback();
            throw new Error(`Lot owner ${lotOwnerId} not found`);
        }

        if (tradeInId) {

            const validTradeIn = await Part.findOne({
                attributes: ["ownerID"],
                where: {
                    partId: tradeInId,
                    ownerID: playerId,
                },
                transaction,
            }).then((tradeIn) => !!tradeIn);

            if (!validTradeIn) {
                await transaction.rollback();
                throw new Error(`Trade-in ${tradeInId} not owned by player ${playerId}`);
            }           

            tradeInValue = await Part.findOne({
                attributes: ["scrapValue"],
                where: {
                    partId: tradeInId,
                },
                transaction,
            }).then((tradeIn) => tradeIn?.scrapValue ?? 0);

            if (!tradeInValue) {
                await transaction.rollback();
                throw new Error(`Trade-in value not found for part ${tradeInId}`);
            }

            const scrapyardLotFound = await Warehouse.findOne({
                attributes: ["playerID"],
                where: {
                    playerID: scrapyardLotId
                },
                transaction,
            }).then((scrapyardLot) => !!scrapyardLot);

            if (!scrapyardLotFound) {
                await transaction.rollback();
                throw new Error(`Scrapyard lot ${scrapyardLotId} not found`);
            }


        }




        log.debug("Transaction committed");
    }

    return Promise.resolve(0);    
}
