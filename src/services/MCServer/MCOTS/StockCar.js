// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { logger } = require('../../../shared/logger')

const debug = require('debug')

/**
 * Container objest for Stock cars
 * @module StockCar
 */

// DWORD   brandedPartID;
// DWORD   retailPrice;
// WORD    bIsDealOfTheDay;

/**
 * @class
 * @property {Logger} logger
 * @property {number} brandedPartId
 * @property {number} retailPrice
 * @property {0 | 1} bIsDealOfTheDay
 */
class StockCar {
  /**
   * @param {number} brandedPartId
   * @param {number} retailPrice
   * @param {0|1} bIsDealOfTheDay
   */
  constructor (brandedPartId, retailPrice, bIsDealOfTheDay) {
    this.logger = logger.child({ service: 'mcoserver:StockCar' })

    this.brandedPartId = brandedPartId
    this.retailPrice = retailPrice
    this.bIsDealOfTheDay = bIsDealOfTheDay
  }

  /**
   *
   * @return {Buffer}
   */
  serialize () {
    const packet = Buffer.alloc(10)
    packet.writeInt32LE(this.brandedPartId, 0)
    packet.writeInt32LE(this.retailPrice, 4)
    packet.writeInt16LE(this.bIsDealOfTheDay, 8)
    return packet
  }

  /**
   * dumpPacket
   * @returns {void}
   */
  dumpPacket () {
    debug('mcoserver:StockCar')('[StockCar]======================================')
    debug('mcoserver:StockCar')(`brandedPartId:     ${this.brandedPartId}`)
    debug('mcoserver:StockCar')(`retailPrice        ${this.retailPrice}`)
    debug('mcoserver:StockCar')(`isDealOfTheDay:    ${this.bIsDealOfTheDay}`)
    debug('mcoserver:StockCar')('[/StockCar]======================================')
  }
}
module.exports.StockCar = StockCar
