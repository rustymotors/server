/// <reference types="node" />
/**
 * Container objest for Stock cars
 */
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
     * @param {0|1} bIsDealOfTheDay
     */
    constructor(brandedPartId: number, retailPrice: number, bIsDealOfTheDay: 0 | 1);
    brandedPartId: number;
    retailPrice: number;
    bIsDealOfTheDay: 0 | 1;
    serviceName: string;
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
import { Buffer } from "buffer";
