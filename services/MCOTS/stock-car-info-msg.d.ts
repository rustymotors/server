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
   * @param {number} starterCash
   * @param {number} dealerId
   * @param {number} brand
   * @memberof StockCarInfoMsg
   */
  constructor(starterCash: number, dealerId: number, brand: number)
  msgNo: number
  starterCash: number
  dealerId: number
  brand: number
  noCars: number
  moreToCome: number
  StockCarList: any[]
  serviceName: string
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
import { StockCar } from './stock-car.js'
import { Buffer } from 'buffer'
