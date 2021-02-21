// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import debug from 'debug'

/**
 * Packet structure for communications with the game database
 * @module MessageNode
 */

export enum MESSAGE_DIRECTION {
  'RECIEVED',
  'SENT'
}

/**
 *
 */
export class MessageNode {
  direction: MESSAGE_DIRECTION
  msgNo: number
  seq: number
  flags: number
  data: Buffer
  dataLength: number
  mcoSig: string
  toFrom: number
  appId: number
  /**
   *
   * @param {MESSAGE_DIRECTION} direction
   */
  constructor (direction: MESSAGE_DIRECTION) {
    this.direction = direction
    this.msgNo = 0
    this.seq = 999
    this.flags = 0
    this.data = Buffer.alloc(0)
    this.dataLength = 0
    this.mcoSig = 'NotAValue'

    this.toFrom = 0
    this.appId = 0
  }

  /**
   *
   * @param {Buffer} packet
   */
  deserialize (packet: Buffer): void {
    try {
      this.dataLength = packet.readInt16LE(0)
      this.mcoSig = packet.slice(2, 6).toString()
      this.seq = packet.readInt16LE(6)
      this.flags = packet.readInt8(10)

      // data starts at offset 11
      this.data = packet.slice(11)

      // set message number

      this.msgNo = this.data.readInt16LE(0)
    } catch (error) {
      if (error.name.includes('RangeError')) {
        // This is likeley not an MCOTS packet, ignore
        throw new Error(
          `[MessageNode] Not long enough to deserialize, only ${packet.length} bytes long`
        )
      } else {
        throw new Error(
          `[MessageNode] Unable to read msgNo from ${packet.toString(
            'hex'
          )}: ${error}`
        )
      }
    }
  }

  /**
   *
   * @return {Buffer}
   */
  serialize (): Buffer {
    const packet = Buffer.alloc(this.dataLength + 2)
    packet.writeInt16LE(this.dataLength, 0)
    packet.write(this.mcoSig, 2)
    packet.writeInt16LE(this.seq, 6)
    packet.writeInt8(this.flags, 10)
    this.data.copy(packet, 11)
    return packet
  }

  /**
   *
   * @param {number} appId
   */
  setAppId (appId: number): void {
    this.appId = appId
  }

  /**
   *
   * @param {number} newMsgNo
   */
  setMsgNo (newMsgNo: number): void {
    this.msgNo = newMsgNo
    this.data.writeInt16LE(this.msgNo, 0)
  }

  /**
   *
   * @param {number} newSeq
   */
  setSeq (newSeq: number): void {
    this.seq = newSeq
  }

  /**
   *
   * @param {Buffer} packet
   */
  setMsgHeader (packet: Buffer): void {
    const header = Buffer.alloc(6)
    packet.copy(header, 0, 0, 6)
    // this.header = new MsgHead(header);
  }

  /**
   *
   * @param {Buffer} buffer
   */
  updateBuffer (buffer: Buffer): void {
    this.data = Buffer.from(buffer)
    this.dataLength = 10 + buffer.length
    this.msgNo = this.data.readInt16LE(0)
  }

  /**
   *
   * @return {boolean}
   */
  isMCOTS (): boolean {
    return this.mcoSig === 'TOMC'
  }

  /**
   *
   */
  dumpPacket (): void {
    let packetContentsArray = this.serialize()
      .toString('hex')
      .match(/../g)
    if (packetContentsArray == null) {
      packetContentsArray = []
    }
    debug('mcoserver:MessageNode')(
      `MessageNode: ${JSON.stringify({
        dataLength: this.dataLength,
        isMCOTS: this.isMCOTS(),
        msgNo: this.msgNo,
        direction: this.direction,
        seq: this.seq,
        flags: this.flags,
        toFrom: this.toFrom,
        appId: this.appId,
        packetContents: packetContentsArray.join('') || ''
      })}`
    )
  }

  /**
   *
   * @return {number}
   */
  getLength (): number {
    return this.dataLength
  }

  /**
   *
   * @param {Buffer} packet
   */
  BaseMsgHeader (packet: Buffer): void {
    // WORD msgNo;
    this.msgNo = packet.readInt16LE(0)
  }
}
