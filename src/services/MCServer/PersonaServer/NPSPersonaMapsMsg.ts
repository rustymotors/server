// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { MESSAGE_DIRECTION } from '../MCOTS/MessageNode'
import { logger } from '../../../shared/logger'

import struct from 'c-struct'
import { NPSMsg } from '../MCOTS/NPSMsg'
import { IPersonaRecord } from '../../../types'

import debug from 'debug'

const npsPersonaMapsMsgSchema = new struct.Schema({
  msgNo: struct.type.uint16,
  msgLength: struct.type.uint16,
  msgVersion: struct.type.uint16,
  reserved: struct.type.uint16,
  msgChecksum: struct.type.uint32,
  // End of header
  personas: [
    {
      personaCount: struct.type.uint16,
      unknown1: struct.type.uint16,
      maxPersonas: struct.type.uint16,
      unknown2: struct.type.uint16,
      id: struct.type.uint32,
      shardId: struct.type.uint32,
      unknown3: struct.type.uint16,
      unknown4: struct.type.uint16,
      personaNameLength: struct.type.uint16,
      name: struct.type.string(16)
    }
  ]
})

// register to cache
struct.register('NPSPersonaMapsMsg', npsPersonaMapsMsgSchema)

/**
 *
 * @extends {NPSMsg}
 */
export class NPSPersonaMapsMsg extends NPSMsg {
  personas: IPersonaRecord[]
  personaSize: number
  personaCount: number
  struct: Record<string, unknown>
  /**
   *
   * @param {'Recieved'|'Sent'} direction
   */
  constructor (direction: MESSAGE_DIRECTION) {
    super(direction)

    this.logger = logger.child({ service: 'mcoserver:NPSPersonaMapsMsg' })
    /** @type {IPersonaRecord[]} */
    this.personas = []
    // public personaSize = 1296;
    this.personaSize = 40
    this.msgNo = 0x607
    this.personaCount = 0
    this.struct = struct.unpackSync('NPSPersonaMapsMsg', Buffer.alloc(100), {})

    this.struct.msgNo = this.msgNo
  }

  /**
   *
   * @param {IPersonaRecord[]} personas
   */
  loadMaps (personas: IPersonaRecord[]): void {
    this.personaCount = personas.length
    this.personas = []
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
  }

  /**
   *
   * @param {Buffer} buf
   * @return {number}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeInt8 (buf: Buffer): number {
    return buf.readInt8(0)
  }

  /**
   *
   * @param {Buffer} buf
   * @return {number}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeInt32 (buf: Buffer): number {
    return buf.readInt32BE(0)
  }

  /**
   *
   * @param {Buffer} buf
   * @return {string}
   * @memberof! NPSPersonaMapsMsg
   */
  deserializeString (buf: Buffer): string {
    return buf.toString('utf8')
  }

  /**
   *
   * @return {any}
   */
  serialize (): Buffer {
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
    const msgLength = struct.packSync('NPSPersonaMapsMsg', this.struct, { endian: 'b' }).length
    this.struct.msgLength = msgLength
    this.struct.msgChecksum = msgLength
    return struct.packSync('NPSPersonaMapsMsg', this.struct, {
      endian: 'b'
    })
  }

  /**
   *
   */
  dumpPacket (): void {
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
