/**
 * Container object for Stock cars
 */
// DWORD   brandedPartID;
// DWORD   retailPrice;
// WORD    bIsDealOfTheDay;
/**
 * @class
 * @property {number} brandedPartId
 * @property {number} retailPrice
 * @property {0 | 1} bIsDealOfTheDay
 */

export class StockCar {
    /**
     * @param {number} brandedPartId
     * @param {number} retailPrice
     * @param {boolean} bIsDealOfTheDay
     */
    constructor(brandedPartId, retailPrice, bIsDealOfTheDay) {
        this.brandedPartId = brandedPartId; // 4 bytes
        this.retailPrice = retailPrice; // 4 bytes
        this.bIsDealOfTheDay = bIsDealOfTheDay; // 2 bytes
    }

    /**
     *
     * @return {Buffer}
     */
    serialize() {
        const packet = Buffer.alloc(10);
        packet.writeInt32LE(this.brandedPartId, 0);
        packet.writeInt32LE(this.retailPrice, 4);
        packet.writeInt16LE(this.bIsDealOfTheDay ? 1 : 0, 8);
        return packet;
    }

    /**
     * @return {string}
     */
    toString() {
        return `
        [StockCar]======================================
        brandedPartId:     ${this.brandedPartId}
        retailPrice:       ${this.retailPrice}
        isDealOfTheDay:    ${this.bIsDealOfTheDay}
        [/StockCar]======================================`;
    }
}
