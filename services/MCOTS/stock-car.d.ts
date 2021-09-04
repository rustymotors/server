/// <reference types="node" />
/**
 * Container objest for Stock cars
 * @module StockCar
 */
/**
 * @class
 * @property {number} brandedPartId
 * @property {number} retailPrice
 * @property {0 | 1} bIsDealOfTheDay
 */
export declare class StockCar {
  brandedPartId: number
  retailPrice: number
  bIsDealOfTheDay: number
  serviceName: string
  /**
   * @param {number} brandedPartId
   * @param {number} retailPrice
   * @param {0|1} bIsDealOfTheDay
   */
  constructor(
    brandedPartId: number,
    retailPrice: number,
    bIsDealOfTheDay: number,
  )
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
