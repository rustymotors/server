// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const logger = require('../../@mcoserver/mco-logger').child({ service: 'mcoserver:LoginMsg' })

const struct = require('c-struct')

/**
 * @module LoginMsg
 */

const loginMsgSchema = new struct.Schema({
  msgNo: struct.type.uint16,
  customerId: struct.type.uint32,
  personaId: struct.type.uint32,
  lotOwnerId: struct.type.uint32,
  brandedPartId: struct.type.uint32,
  skinId: struct.type.uint32,
  personaName: struct.type.string(12),
  version: struct.type.string()
})

// register to cache
struct.register('LoginMsg', loginMsgSchema)

/**
 * @class
 * @property {number} newMsgNo
 * @property {number} toFrom
 * @property {number} appId
 * @property {number} customerId
 * @property {number} personaId
 * @property {number} lotOwnerId
 * @property {number} brandedPartId
 * @property {number} skinId
 * @property {string} personaName
 * @property {string} version
 * @property {Buffer} data
 * @property {Record<string, unknown>} struct
 */
class LoginMsg {
  /**
   *
   * @param {Buffer} buffer
   */
  constructor (buffer) {
    this.msgNo = 0
    this.toFrom = 0
    this.appId = 0

    // TODO: Why do I set these if I turn around and deserialize after?
    this.customerId = 0
    this.personaId = 0
    this.lotOwnerId = 0
    this.brandedPartId = 0
    this.skinId = 0
    this.personaName = 'NotAPerson'
    this.version = '0.0.0.0'
    this.data = buffer

    this.deserialize(buffer)

    this.struct = struct.unpackSync('LoginMsg', buffer, { endian: 'b' })
  }

  /**
   *
   * @param {Buffer} buffer
   * @returns {void}
   */
  deserialize (buffer) {
    try {
      this.msgNo = buffer.readInt16LE(0)
    } catch (error) {
      if (error instanceof RangeError) {
        // This is likeley not an MCOTS packet, ignore
      } else if (error instanceof Error) {
        throw new Error(
          `[LoginMsg] Unable to read msgNo from ${buffer.toString(
            'hex'
          )}: ${error}`
        )
      }
      throw new Error(
        `[LoginMsg] Unable to read msgNo from ${buffer.toString(
          'hex'
        )}, error unknown`
      )
    }

    this.customerId = buffer.readInt32LE(2)
    this.personaId = buffer.readInt32LE(6)

    this.lotOwnerId = buffer.readInt32LE(10)
    this.brandedPartId = buffer.readInt32LE(14)
    this.skinId = buffer.readInt32LE(18)
    this.personaName = buffer.slice(22, 34).toString()

    this.version = buffer.slice(34).toString()
  }

  /**
   *
   * @return {Buffer}
   */
  serialize () {
    return struct.packSync('LoginMsg', this.struct, { endian: 'b' })
  }

  /**
   * dumpPacket
   * @returns {void}
   */
  dumpPacket () {
    logger.info(
      'LoginMsg',
      {
        msgNo: this.msgNo.toString(),
        customerId: this.customerId.toString(),
        personaId: this.personaId.toString(),
        lotOwnerId: this.lotOwnerId,
        brandedPartId: this.brandedPartId,
        skinId: this.skinId,
        personaName: this.personaName,
        version: this.version
      }
    )
  }
}
module.exports.LoginMsg = LoginMsg
