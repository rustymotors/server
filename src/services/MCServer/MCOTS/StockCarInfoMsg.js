// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { log } = require('../../@mcoserver/mco-logger')

/**
 * Object for providing information on stock cars
 * @module StockCarInfoMsg
 */

// WORD     msgNo;
// DWORD    starterCash; // when called from the create persona screen,
//                      //  this indicates how much cash a persona starts out with
// DWORD    dealerID;   // for easy match up
// DWORD    brand;
// WORD     noCars;
// BYTE     moreToCome;     // if 1, expect another msg, otherwise don't
// StockCar carInfo[1];

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
class StockCarInfoMsg {
  /**
   * Creates an instance of StockCarInfoMsg.
   * @class
   * @param {number} starterCash
   * @param {number} dealerId
   * @param {number} brand
   * @memberof StockCarInfoMsg
   */
  constructor (starterCash, dealerId, brand) {
    this.msgNo = 141
    this.starterCash = starterCash
    this.dealerId = dealerId
    this.brand = brand
    /** Number of cars */
    this.noCars = 1
    /** @type {0|1} */
    this.moreToCome = 0
    /** @type {module:StockCar} */
    this.StockCarList = []
    this.serviceName = 'mcoserver:StockCarInfoMsg'
  }

  /**
   *
   * @param {StockCar} car
   * @returns {void}
   */
  addStockCar (car) {
    this.StockCarList.push(car)
    this.noCars = this.StockCarList.length
  }

  /**
   *
   * @return {Buffer}
   */
  serialize () {
    // This does not count the StockCar array
    const packet = Buffer.alloc(17 + 9 * this.StockCarList.length)
    packet.writeInt16LE(this.msgNo, 0)
    packet.writeInt32LE(this.starterCash, 2)
    packet.writeInt32LE(this.dealerId, 6)
    packet.writeInt32LE(this.brand, 10)
    packet.writeInt16LE(this.noCars, 14)
    packet.writeInt8(this.moreToCome, 16)
    if (this.StockCarList.length > 0) {
      this.StockCarList.forEach((/** @type {module:StocCar} */ stockCar, /** @type {number} */ i) => {
        const offset = 10 * i
        stockCar.serialize().copy(packet, 17 + offset)
      })
    }
    return packet
  }

  /**
   * dumpPacket
   * @returns {void}
   */
  dumpPacket () {
    log(
      `${{
        msgNo: this.msgNo,
        starterCash: this.starterCash,
        dealerId: this.dealerId,
        brand: this.brand,
        noCars: this.noCars,
        moreToCome: this.moreToCome,
        stockCarList: this.StockCarList.toString()
      }}`, { service: this.serviceName, level: 'debug'}
    )
  }
}
module.exports.StockCarInfoMsg = StockCarInfoMsg
