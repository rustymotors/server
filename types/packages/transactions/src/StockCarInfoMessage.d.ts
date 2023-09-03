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
/// <reference types="node" resolution-mode="require"/>
import { MessageNode } from "../../shared/MessageNode.js";
import { StockCar } from "./StockCar.js";
export declare class StockCarInfoMessage extends MessageNode {
    msgNo: number;
    starterCash: number;
    dealerId: number;
    brand: number;
    noCars: number;
    moreToCome: number;
    /**
     *
     * @type {StockCar[]}
     * @memberof StockCarInfoMessage
     */
    StockCarList: StockCar[];
    /**
     *
     *
     * @type {string}
     * @memberof StockCarInfoMessage
     */
    serviceName: string;
    /**
     * Creates an instance of StockCarInfoMsg.
     * @class
     * @param {number} starterCash
     * @param {number} dealerId
     * @param {number} brand
     * @memberof StockCarInfoMsg
     */
    constructor(starterCash: number, dealerId: number, brand: number);
    /**
     *
     * @param {StockCar} car
     */
    addStockCar(car: StockCar): void;
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
//# sourceMappingURL=StockCarInfoMessage.d.ts.map