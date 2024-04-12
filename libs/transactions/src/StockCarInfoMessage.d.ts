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
/// <reference types="node" />
import { MessageNode } from "rusty-shared";
type StockCar = import("./StockCar.js").StockCar;
export declare class StockCarInfoMessage extends MessageNode {
    starterCash: number;
    dealerId: number;
    brand: number;
    noCars: number;
    moreToCome: boolean;
    StockCarList: StockCar[];
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
     * @override
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     * @override
     */
    toString(): string;
}
export {};
