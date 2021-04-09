// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
const { Socket } = require('net')

const { logger } = require('../../../shared/logger')
const crypto = require('crypto')
const fs = require('fs')
const { NPSMsg } = require('../MCOTS/NPSMsg')
const debug = require('debug')

/**
 * 
 * @module NPSUserStatus
 */

/**
 * Load the RSA private key
 *
 * @param {string} privateKeyPath
 * @return {string}
 */
function fetchPrivateKeyFromFile (privateKeyPath) {
  try {
    fs.statSync(privateKeyPath)
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`[npsUserStatus] Error loading private key: ${e.message}`)
    }
    throw new Error(`[npsUserStatus] Error loading private key, error unknown`)
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
 * @class
 * @extends {NPSMsg}
 * @property {string} sessionkey
 * @property {string} opCode
 * @property {Buffer} buffer
 */
class NPSUserStatus extends NPSMsg {

  /**
   *
   * @param {Buffer} packet
   */
  constructor (packet) {
    super('RECEIVED')
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
   * @returns {void}
   */
  extractSessionKeyFromPacket (serverConfig, packet) {
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
   * @return {module:NPSMsg.INPSMsgJSON}
   */
  toJSON () {
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
   * @returns {void}
   */
  dumpPacket () {
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
module.exports.NPSUserStatus = NPSUserStatus
