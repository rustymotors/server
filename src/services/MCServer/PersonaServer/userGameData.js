// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const cStruct = require('c-struct')
const { Logger } = require('../../shared/loggerManager')
const { NPSMsg } = require('../MCOTS/NPSMsg')

const npsUserGameDataSchema = new cStruct.Schema({
  msgNo: cStruct.type.uint16,
  msgLength: cStruct.type.uint16,
  msgVersion: cStruct.type.uint16,
  reserved: cStruct.type.uint16,
  msgChecksum: cStruct.type.uint32,
  // End of header
  personaCount: cStruct.type.uint16,
  unknown1: cStruct.type.uint16,
  maxPersonas: cStruct.type.uint16,
  personas: [
    {
      customerId: cStruct.type.uint32,
      gameUserName: cStruct.type.string(33),
      serverDataId: cStruct.type.uint32,
      createDate: cStruct.type.uint32,
      lastLogin: cStruct.type.uint32,
      numGames: cStruct.type.uint32,
      gameUserId: cStruct.type.uint32,
      isOnSystem: cStruct.type.uint16,
      gamePurchaseDate: cStruct.type.uint32,
      gameSerialNumber: cStruct.type.string(33),
      timeOnLine: cStruct.type.uint32,
      timeInGame: cStruct.type.uint32,
      gameSpecific: cStruct.type.string(512),
      personalBlob: cStruct.type.string(256),
      pictureBlob: cStruct.type.string(1),
      dnd: cStruct.type.uint16,
      gameStart: cStruct.type.uint32,
      currentKey: cStruct.type.string(400),
      personaLevel: cStruct.type.uint16,
      shardId: cStruct.type.uint16
    }
  ]
})

// register to cache
cStruct.register('UserGameData', npsUserGameDataSchema)

export class UserGameData extends NPSMsg {
  /**
   *
   */
  constructor () {
    super('Sent')
    this.logger = new Logger().getLogger('NPSUserGameData')
    /** @type {IPersonaRecord[]} */
    this.personas = []

    try {
      this.struct = cStruct.unpackSync('UserGameData', Buffer.alloc(1300))
    } catch (error) {
      console.trace(error)
      this.logger.error({ error }, 'Error unpacking struct')
      process.exit(-1)
    }
  }

  /**
   *
   * @param {IPersonaRecord[]} personas
   * @memberof! UserGameData
   */
  loadMaps (personas) {
    this.struct.personaCount = personas.length
    this.struct.maxPersonas = personas.length
    this.personas = []
    try {
      personas.forEach((persona, idx) => {
        this.struct.personas[idx] = {
          personaCount: personas.length,
          maxPersonas: personas.length,
          id: this.deserializeInt32(persona.id),
          personaNameLength: this.deserializeString(persona.name).length,
          name: this.deserializeString(persona.name),
          shardId: this.deserializeInt32(persona.shardId)
        }
      })
    } catch (error) {
      this.logger.error({ personas }, 'Error loading personas')
    }
  }

  /**
   *
   * @param {Buffer} buf
   * @memberof! UserGameData
   */
  deserializeInt8 (buf) {
    return buf.readInt8(0)
  }

  /**
   *
   * @param {Buffer} buf
   * @memberof! UserGameData
   */
  deserializeInt32 (buf) {
    return buf.readInt32BE(0)
  }

  /**
   *
   * @param {Buffer} buf
   * @memberof! UserGameData
   */
  deserializeString (buf) {
    return buf.toString('utf8')
  }

  /**
   *
   * @memberof! UserGameData
   */
  serialize () {
    // Build the packet
    const msgLength = cStruct.packSync('UserGameData', this.struct).length
    this.struct.msgNo = 0x607
    this.struct.personaCount = 0
    this.struct.msgLength = msgLength
    this.struct.msgChecksum = msgLength
    try {
      return cStruct.packSync('UserGameData', this.struct, {
        endian: 'b'
      })
    } catch (error) {
      console.trace(error)
      this.logger.error({ error }, 'Error packing struct')
      process.exit(-1)
    }
  }
}

module.exports = {
  UserGameData
}
