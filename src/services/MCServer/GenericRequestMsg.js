// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const logger = require('../@mcoserver/mco-logger').child({ service: 'mcoserver:GenericRequestMsg' })

/**
 * @module GenericRequestMsg
 */

// WORD  msgNo;    // typically MC_SUCCESS or MC_FAILURE
// DWORD data;   // specific to the message sent (but usually 0)
// DWORD data2;

/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {Buffer} data
 * @property {Buffer} data2
 */
class GenericRequestMsg {
  /**
   *
   */
  constructor () {
    this.msgNo = 0
    this.data = Buffer.alloc(4)
    this.data2 = Buffer.alloc(4)
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
      } else {
        throw new error(
          `[GenericRequestMsg] Unable to read msgNo from ${buffer.toString(
            'hex'
          )}: ${error}`
        )
      }
    }

    this.data = buffer.slice(2, 6)
    this.data2 = buffer.slice(6)
  }

  /**
   *
   * @return {Buffer}
   */
  serialize () {
    const packet = Buffer.alloc(16)
    packet.writeInt16LE(this.msgNo, 0)
    this.data.copy(packet, 2)
    this.data2.copy(packet, 6)
    return packet
  }

  /**
   * dumpPacket
   * @returns {void}
   */
  dumpPacket () {
    logger.info(
      'GenericRequest',
      {
        msgNo: this.msgNo,
        data: this.data.toString('hex'),
        data2: this.data2.toString('hex')
      }
    )
  }
}
module.exports.GenericRequestMsg = GenericRequestMsg
