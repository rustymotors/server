/* eslint-disable @typescript-eslint/no-unused-vars */
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from '@drazisil/mco-logger'
import { NPSMessage } from 'transactions'
import { Buffer } from 'buffer'
import { NPSMessageFactory } from '../transactions/nps-message-factory'

const { log } = Logger.getInstance()

/**
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
 * @global
 * @typedef {Object} IPersonaRecord
 * @property {number} customerId
 * @property {Buffer} id
 * @property {Buffer} maxPersonas
 * @property {Buffer} name
 * @property {Buffer} personaCount
 * @property {Buffer} shardId
 */

/**
 *
 * @class
 * @extends {NPSMessage}
 * @property {IPersonaRecord[]} personas
 * @property {number} personaSize
 * @property {number} personaCount
 */
export class NPSPersonaMapsMessage {
  /**
   *
   * @param {NPSMessage} message
   * @returns {NPSPersonaMapsMessage}
   */
  static fromMessage(message) {
    return new NPSPersonaMapsMessage(message.direction)
  }

  /**
   *
   * @param {import('types').EMessageDirection} direction
   */
  constructor(direction) {
    this.msgNo = 0
    this.msgVersion = 0
    this.reserved = 0
    this.content = Buffer.from([0x01, 0x02, 0x03, 0x04])
    this.msgLength = this.content.length + 12
    this.direction = direction
    this.serviceName = 'mcoserver:NPSPersonaMapsMessage'
    this.messageType = 'NPSPersonaMapsMessage'

    /** @type {IPersonaRecord[]} */
    this.personas = []
    // Public personaSize = 1296;
    this.personaSize = 38
    this.msgNo = 0x6_07
    this.personaCount = 0
    this.serviceName = 'mcoserver:NPSPersonaMapsMsg'
  }

  /**
   *
   * @param {IPersonaRecord[]} personas
   * @return {void}
   */
  loadMaps(personas) {
    this.personaCount = personas.length
    this.personas = personas
  }

  /**
   *
   * @param {Buffer} buf
   * @return {number}
   */
  deserializeInt8(buf) {
    return buf.readInt8(0)
  }

  /**
   *
   * @param {Buffer} buf
   * @return {number}
   */
  deserializeInt32(buf) {
    return buf.readInt32BE(0)
  }

  /**
   *
   * @param {Buffer} buf
   * @return {string}
   */
  deserializeString(buf) {
    return buf.toString('utf8')
  }

  /**
   *
   * @return {Buffer}
   */
  serialize() {
    let index = 0
    // Create the packet content
    // const packetContent = Buffer.alloc(40);
    const packetContent = Buffer.alloc(this.personaSize * this.personaCount)

    for (const persona of this.personas) {
      // This is the persona count
      packetContent.writeInt16BE(
        this.personaCount,
        this.personaSize * index + 0,
      )

      // This is the max persona count (confirmed - debug)
      packetContent.writeInt8(
        this.deserializeInt8(persona.maxPersonas),
        this.personaSize * index + 5,
      )

      // PersonaId
      packetContent.writeUInt32BE(
        this.deserializeInt32(persona.id),
        this.personaSize * index + 8,
      )

      // Shard ID
      // packetContent.writeInt32BE(this.shardId, 1281);
      packetContent.writeInt32BE(
        this.deserializeInt32(persona.shardId),
        this.personaSize * index + 12,
      )

      // Length of Persona Name
      packetContent.writeInt16BE(
        persona.name.length,
        this.personaSize * index + 20,
      )

      // Persona Name = 30-bit null terminated string
      packetContent.write(
        this.deserializeString(persona.name),
        this.personaSize * index + 22,
      )
      index++
    }

    // Build the packet
    return packetContent
  }

  /**
   *
   * @return {void}
   */
  dumpPacket() {
    NPSMessageFactory.dumpPacketHeader(this, 'NPSPersonaMapsMsg')
    log('debug', `personaCount:        ${this.personaCount}`, {
      service: this.serviceName,
    })
    for (const persona of this.personas) {
      log(
        'debug',
        `
        maxPersonaCount:     ${this.deserializeInt8(persona.maxPersonas)}
        id:                  ${this.deserializeInt32(persona.id)}
        shardId:             ${this.deserializeInt32(persona.shardId)}
        name:                ${this.deserializeString(persona.name)}
        Packet as hex:       ${NPSMessageFactory.getPacketAsString(this)}`,
        {
          service: this.serviceName,
        },
      )

      // TODO: Work on this more

      log(
        'debug',
        '[/NPSPersonaMapsMsg]======================================',
        {
          service: this.serviceName,
        },
      )
    }
  }
}
