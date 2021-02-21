// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { MESSAGE_DIRECTION } from '../MCOTS/MessageNode'
import { logger } from '../../../shared/logger'

import { NPSMsg } from '../MCOTS/NPSMsg'
import { IPersonaRecord } from '../../../types'

import debug from 'debug'

export interface InpsPersonaMapsMsgSchema {
  msgNo: number // uint16,
  msgLength: number // uint16,
  msgVersion: number // uint16,
  reserved: number // uint16,
  msgChecksum: number // uint32,
  // End of header
  personas: [
    {
      personaCount: number // uint16,
      unknown1: number // uint16,
      maxPersonas: number // uint16,
      unknown2: number // uint16,
      id: number // uint32,
      shardId: number // uint32,
      unknown3: number // uint16,
      unknown4: number // uint16,
      personaNameLength: number // uint16,
      name: string // string(16)
    }
  ]
}

/**
 *
 * @extends {NPSMsg}
 */
export class NPSPersonaMapsMsg extends NPSMsg {
  personas: IPersonaRecord[]
  personaSize: number
  personaCount: number
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
    this.personaSize = 38
    this.msgNo = 0x607
    this.personaCount = 0
  }

  /**
   *
   * @param {IPersonaRecord[]} personas
   */
  loadMaps (personas: IPersonaRecord[]): void {
    this.personaCount = personas.length
    this.personas = personas
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
   * @return {Buffer}
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
    return packetContent
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
