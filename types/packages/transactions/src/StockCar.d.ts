/**
 * Container object for Stock cars
 */
/**
 * @class
 * @property {number} brandedPartId
 * @property {number} retailPrice
 * @property {0 | 1} bIsDealOfTheDay
 */
/// <reference types="node" />
export declare class StockCar {
    brandedPartId: number;
    retailPrice: number;
    bIsDealOfTheDay: 0 | 1;
    serviceName: string;
    /**
     * @param {number} brandedPartId
     * @param {number} retailPrice
     * @param {0|1} bIsDealOfTheDay
     */
    constructor(brandedPartId: number, retailPrice: number, bIsDealOfTheDay: 0 | 1);
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string;
}
//# sourceMappingURL=StockCar.d.ts.map