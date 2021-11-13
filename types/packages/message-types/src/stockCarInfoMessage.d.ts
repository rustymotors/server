/// <reference types="node" />
/**
 * Object for providing information on stock cars
 */
/**
 * @class
 * @property {number} msgNo
 * @property {number} starterCash
 * @property {number} dealerId
 * @property {number} brand
 * @property {number} noCars
 * @property {number} moreToCome
 * @property {StockCar[]} StockCarList
 */
export class StockCarInfoMessage {
    /**
     * Creates an instance of StockCarInfoMsg.
     * @class
     */
    constructor(starterCash: any, dealerId: any, brand: any);
    /** @type {number} */
    msgNo: number;
    /** @type {number} */
    starterCash: number;
    /** @type {number} */
    dealerId: number;
    /** @type {number} */
    brand: number;
    /** @type {number} */
    noCars: number;
    /** @type {0 | 1} */
    moreToCome: 0 | 1;
    /** @type {StockCar[]} */
    StockCarList: any[];
    /**
     *
     * @param {StockCar} car
     */
    addStockCar(car: any): void;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     * DumpPacket
     * @returns {string}
     */
    dumpPacket(): string;
}
import { Buffer } from "buffer";
