/// <reference types="node" />
import { StockCar } from './stock-car'
/**
 * Object for providing information on stock cars
 * @module StockCarInfoMsg
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
export declare class StockCarInfoMessage {
  msgNo: number
  starterCash: number
  dealerId: number
  brand: number
  noCars: number
  moreToCome: number
  StockCarList: StockCar[]
  serviceName: string
  /**
   * Creates an instance of StockCarInfoMsg.
   * @class
   * @param {number} starterCash
   * @param {number} dealerId
   * @param {number} brand
   * @memberof StockCarInfoMsg
   */
  constructor(starterCash: number, dealerId: number, brand: number)
  /**
   *
   * @param {StockCar} car
   * @return {void}
   */
  addStockCar(car: StockCar): void
  /**
   *
   * @return {Buffer}
   */
  serialize(): Buffer
  /**
   * DumpPacket
   * @return {void}
   */
  dumpPacket(): void
}
