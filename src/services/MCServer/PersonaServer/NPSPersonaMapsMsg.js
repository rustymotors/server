// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { logger } = require('../../../shared/logger')

const { NPSMsg } = require('../MCOTS/NPSMsg')

const debug = require('debug')

/**
 * @module NPSPersonaMapsMsg
 */

/**
 * @typedef InpsPersonaMapsPersonaRecord
 * @property {number} personaCount - uint16
 * @property {number} unknown1 - uint16
 * @property {number} maxPersonas - uint16
 * @property {number} unknown2 - uint16
 * @property {number} id - uint32
 * @property {number} shardId - uint32
 * @property {number} unknown3 - uint16
 * @property {number} unknown4 - uint16
 * @property {number} personaNameLength - uint16
 * @property {string} name - string(16)
 */

/**
 * @typedef InpsPersonaMapsMsgSchema
 * @property {number} msgNo - uint16
 * @property {number} msgLength - uint16
 * @property {number} msgVersion - uint16
 * @property {number} reserved - uint16
 * @property {number} msgChecksum - uint16
 * @property {InpsPersonaMapsPersonaRecord[]} personas
 */


/**
 *
 * @class
 * @extends {NPSMsg}
 * @property {IPersonaRecord[]} personas
 * @property {number} personaSize
 * @property {number} personaCount
 */
class NPSPersonaMapsMsg extends NPSMsg {
  /**
   *
   * @param {module:MessageNode.MESSAGE_DIRECTION} direction
   */
  constructor (direction) {
    super(direction)

    this.logger = logger.child({ service: 'mcoserver:NPSPersonaMapsMsg' })
    /** @type {IPersonaRecord[]} */
    this.personas = []
    // public personaSize = 1296;
    this.personaSize = 38
    this.msgNo = 0x607
    this.personaCount = 0
  }

  /**
   *
   * @param {IPersonaRecord[]} personas
   * @returns {void}
   */
  loadMaps (personas) {
    this.personaCount = personas.length
    this.personas = personas
  }

  /**
   *
   * @param {Buffer} buf
   * @return {number}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeInt8 (buf) {
    return buf.readInt8(0)
  }

  /**
   *
   * @param {Buffer} buf
   * @return {number}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeInt32 (buf) {
    return buf.readInt32BE(0)
  }

  /**
   *
   * @param {Buffer} buf
   * @return {string}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeString (buf) {
    return buf.toString('utf8')
  }

  /**
   *
   * @return {Buffer}
   */
  serialize () {
    let index = 0
    // Create the packet content
    // const packetContent = Buffer.alloc(40);
    const packetContent = Buffer.alloc(this.personaSize * this.personaCount)

    for (const persona of this.personas) {
      // This is the persona count
      packetContent.writeInt16BE(
        this.personaCount,
        this.personaSize * index + 0
      )

      // This is the max persona count (confirmed - debug)
      packetContent.writeInt8(
        this.deserializeInt8(persona.maxPersonas),
        this.personaSize * index + 5
      )

      // PersonaId
      packetContent.writeUInt32BE(
        this.deserializeInt32(persona.id),
        this.personaSize * index + 8
      )

      // Shard ID
      // packetContent.writeInt32BE(this.shardId, 1281);
      packetContent.writeInt32BE(
        this.deserializeInt32(persona.shardId),
        this.personaSize * index + 12
      )

      // Length of Persona Name
      packetContent.writeInt16BE(
        persona.name.length,
        this.personaSize * index + 20
      )

      // Persona Name = 30-bit null terminated string
      packetContent.write(
        this.deserializeString(persona.name),
        this.personaSize * index + 22
      )
      index++
    }

    // Build the packet
    return packetContent
  }

  /**
   *
   * @returns {void}
   */
  dumpPacket () {
    this.dumpPacketHeader('NPSPersonaMapsMsg')
    debug('mcoserver:NPSPersonaMapsMsg')(`personaCount:        ${this.personaCount}`)
    for (const persona of this.personas) {
      debug('mcoserver:NPSPersonaMapsMsg')(`maxPersonaCount:     ${this.deserializeInt8(persona.maxPersonas)}`)
      debug('mcoserver:NPSPersonaMapsMsg')(`id:                  ${this.deserializeInt32(persona.id)}`)
      debug('mcoserver:NPSPersonaMapsMsg')(`shardId:             ${this.deserializeInt32(persona.shardId)}`)
      debug('mcoserver:NPSPersonaMapsMsg')(`name:                ${this.deserializeString(persona.name)}`)
    }
    debug('mcoserver:NPSPersonaMapsMsg')(`Packet as hex:       ${this.getPacketAsString()}`)

    // TODO: Work on this more

    debug('mcoserver:NPSPersonaMapsMsg')('[/NPSPersonaMapsMsg]======================================')
  }
}
module.exports.NPSPersonaMapsMsg = NPSPersonaMapsMsg
