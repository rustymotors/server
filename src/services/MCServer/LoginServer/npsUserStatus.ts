// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { logger } from '../../../shared/logger'
import crypto from 'crypto'
import fs from 'fs'
import { NPSMsg } from '../MCOTS/NPSMsg'
import { MESSAGE_DIRECTION } from '../MCOTS/MessageNode'
import { IServerConfig } from '../../../types'
import debug from 'debug'
import { VError } from 'verror'

/**
 * Load the RSA private key
 *
 * @param {string} privateKeyPath
 * @return {string}
 */
export function fetchPrivateKeyFromFile (privateKeyPath: string): string {
  try {
    fs.statSync(privateKeyPath)
  } catch (e) {
    throw new VError(`[npsUserStatus] Error loading private key: ${e}`)
  }
  return fs.readFileSync(privateKeyPath).toString()
}

/**
 * Structure the raw packet into a login packet structure
 * @param {Socket} socket
 * @param {Buffer} packet
 * @return {LoginPacket}
 */

/**
 *
 * @extends {NPSMsg}
 */
export class NPSUserStatus extends NPSMsg {
  sessionkey: string
  opCode: number
  contextId: string
  buffer: Buffer

  /**
   *
   * @param {Buffer} packet
   */
  constructor (packet: Buffer) {
    super(MESSAGE_DIRECTION.RECIEVED)
    this.logger = logger.child({ service: 'mcoserver:NPSUserStatus' })
    this.sessionkey = ''

    // Save the NPS opCode
    this.opCode = packet.readInt16LE(0)

    // Save the contextId
    this.contextId = packet.slice(14, 48).toString()

    // Save the raw packet
    this.buffer = packet

    return this
  }

  /**
   * extractSessionKeyFromPacket
   *
   * Take 128 bytes
   * They are the utf-8 of the hex bytes that are the key
   *
   * @param {IServerConfig} serverConfig
   * @param {Buffer} packet
   */
  extractSessionKeyFromPacket (serverConfig: IServerConfig, packet: Buffer): void {
    // Decrypt the sessionkey
    const privateKey = fetchPrivateKeyFromFile(serverConfig.privateKeyFilename)

    const sessionkeyStr = Buffer.from(
      packet.slice(52, -10).toString('utf8'),
      'hex'
    )
    const decrypted = crypto.privateDecrypt(privateKey, sessionkeyStr)
    this.sessionkey = decrypted.slice(2, -4).toString('hex')
  }

  /**
   *
   * @return {INPSMsgJSON}
   */
  toJSON (): { msgNo: number,
    msgLength: number,
    msgVersion: number,
    content: string,
    direction: MESSAGE_DIRECTION,
    opCode: number,
    contextId: string,
    sessionkey: string,
    rawBuffer: string} {
    return {
      msgNo: this.msgNo,
      msgLength: this.msgLength,
      msgVersion: this.msgVersion,
      content: this.content.toString('hex'),
      direction: this.direction,
      opCode: this.opCode,
      contextId: this.contextId,
      sessionkey: this.sessionkey,
      rawBuffer: this.buffer.toString('hex')
    }
  }

  /**
   *
   */
  dumpPacket (): void {
    this.dumpPacketHeader('NPSUserStatus')
    debug('mcoserver:npsUserStatus')(
      'NPSUserStatus',
      {
        contextId: this.contextId,
        sessionkey: this.sessionkey
      }
    )
  }
}
