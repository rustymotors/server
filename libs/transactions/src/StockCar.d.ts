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
    bIsDealOfTheDay: boolean;
    /**
     * @param {number} brandedPartId
     * @param {number} retailPrice
     * @param {boolean} bIsDealOfTheDay
     */
    constructor(
        brandedPartId: number,
        retailPrice: number,
        bIsDealOfTheDay: boolean,
    );
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     * @return {string}
     */
    toString(): string;
}
