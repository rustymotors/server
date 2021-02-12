// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const debug = require('debug')('mcoserver:LobbyServer')
const { appSettings } = require('../../../../config/app-settings')
const { NPSMsg } = require('../MCOTS/NPSMsg')
const { NPSUserInfo } = require('./npsUserInfo')
const { PersonaServer } = require('../PersonaServer/PersonaServer')
const { DatabaseManager, Session_Record } = require('../../../shared/databaseManager')
const { ConnectionObj } = require('../ConnectionObj')
const { IRawPacket } = require('../listenerThread')

const logger = require('../../../shared/logger').logger.child({
  service: 'mcoserver:LobbyServer'
})

const databaseManager = new DatabaseManager(
  logger.child({ service: 'mcoserver:DatabaseManager' })
)

/**
 *
 * @param {ConnectionObj} conn
 * @param {Buffer} buffer
 * @return {Promise<ConnectionObj>}
 */
async function npsSocketWriteIfOpen(conn, buffer) {
  const sock = conn.sock
  if (sock.writable) {
    // Write the packet to socket
    sock.write(buffer)
  } else {
    throw new Error(
      `[Lobby] Error writing ${buffer.toString('hex')} to ${sock.remoteAddress
      } , ${sock}`
    )
  }
  return conn
}

/**
 * Takes an encrypted command packet and returns the decrypted bytes
 *
 * @return {ConnectionObj}
 * @param {ConnectionObj} con
 * @param {Buffer} cypherCmd
 */
function decryptCmd(con, cypherCmd) {
  const s = con
  const decryptedCommand = s.decipherBufferDES(cypherCmd)
  s.decryptedCmd = decryptedCommand
  logger.info(`[lobby] Deciphered Cmd: ${s.decryptedCmd.toString('hex')}`)
  return s
}

/**
 * Takes an plaintext command packet and return the encrypted bytes
 *
 * @param {ConnectionObj} con
 * @param {Buffer} cypherCmd
 * @return {ConnectionObj}
 */
function encryptCmd(con, cypherCmd) {
  const s = con
  s.encryptedCmd = s.cipherBufferDES(cypherCmd)
  return s
}

/**
 * Takes a plaintext command packet, encrypts it, and sends it across the connection's socket
 *
 * @param {ConnectionObj} con
 * @param {Buffer} data
 * @return {Promise<ConnectionObj>}
 */
async function sendCommand(con, data) {
  const s = con

  const decipheredCommand = decryptCmd(s, Buffer.from(data.slice(4)))
    .decryptedCmd

  // Marshal the command into an NPS packet
  const incommingRequest = new NPSMsg('Recieved')
  incommingRequest.deserialize(decipheredCommand)

  incommingRequest.dumpPacket()

  // Create the packet content
  const packetContent = Buffer.alloc(375)

  // Add the response code
  packetContent.writeUInt16BE(0x0219, 367)
  packetContent.writeUInt16BE(0x0101, 369)
  packetContent.writeUInt16BE(0x022c, 371)

  logger.warn('Sending a dummy response of 0x229 - NPS_MINI_USER_LIST')

  // Build the packet
  const packetResult = new NPSMsg('Sent')
  packetResult.msgNo = 0x229
  packetResult.setContent(packetContent)
  packetResult.dumpPacket()
  // const packetResult = buildPacket(32, 0x0229, packetContent);

  const cmdEncrypted = encryptCmd(s, packetResult.getContentAsBuffer())

  cmdEncrypted.encryptedCmd = Buffer.concat([
    Buffer.from([0x11, 0x01]),
    cmdEncrypted.encryptedCmd
  ])

  return cmdEncrypted
}

/**
 *
 */
class LobbyServer {
  /**
   *
   * @return {NPSMsg}
   */
  _npsHeartbeat() {
    const packetContent = Buffer.alloc(8)
    const packetResult = new NPSMsg('Sent')
    packetResult.msgNo = 0x127
    packetResult.setContent(packetContent)
    packetResult.dumpPacket()
    // const packetResult = buildPacket(8, 0x0127, packetContent);
    return packetResult
  }

  /**
   *
   * @param {IRawPacket} rawPacket
   * @return {Promise<ConnectionObj>}
   */
  async dataHandler(rawPacket) {
    const { localPort, remoteAddress } = rawPacket
    logger.info(`Received Lobby packet: ${JSON.stringify({ localPort, remoteAddress })}`)
    const { connection, data } = rawPacket
    let updatedConnection = connection
    const requestCode = data.readUInt16BE(0).toString(16)

    switch (requestCode) {
      // _npsRequestGameConnectServer
      case '100': {
        const responsePacket = await this._npsRequestGameConnectServer(
          connection,
          data
        )
        logger.info(
          `Connect responsePacket's data prior to sending: ${JSON.stringify({ data: responsePacket.getPacketAsString() })}`
        )
        // TODO: Investigate why this crashes retail
        try {
          npsSocketWriteIfOpen(connection, responsePacket.serialize())
        } catch (error) {
          logger.warn(`Unable to send Connect packet: ${error}`)
        }
        break
      }
      // npsHeartbeat
      case '217': {
        const responsePacket = await this._npsHeartbeat()
        logger.info(
          `Heartbeat responsePacket's data prior to sending: ${JSON.stringify({ data: responsePacket.getPacketAsString() })}`
        )
        npsSocketWriteIfOpen(connection, responsePacket.serialize())
        break
      }
      // npsSendCommand
      case '1101': {
        // This is an encrypted command
        // Fetch session key

        updatedConnection = await sendCommand(connection, data)
        const { encryptedCmd } = updatedConnection

        if (encryptedCmd == null) {
          throw new Error(
            `Error with encrypted command, dumping connection: ${JSON.stringify({ updatedConnection })}`
          )
        }

        logger.info(
          `encrypedCommand's data prior to sending: ${JSON.stringify({ data: encryptedCmd.toString('hex') })}`
        )
        npsSocketWriteIfOpen(connection, encryptedCmd)
        break
      }
      default:
        throw new Error(
          `[Lobby] Unknown code ${requestCode} was received on port 7003`
        )
    }
    return updatedConnection
  }

  /**
   *
   * @param {string} key
   * @return {Buffer}
   */
  _generateSessionKeyBuffer(key) {
    const nameBuffer = Buffer.alloc(64)
    Buffer.from(key, 'utf8').copy(nameBuffer)
    return nameBuffer
  }

  /**
   * Handle a request to connect to a game server packet
   *
   * @param {ConnectionObj} connection
   * @param {Buffer} rawData
   */
  async _npsRequestGameConnectServer(connection, rawData) {
    const { sock } = connection
    logger.info(
      `_npsRequestGameConnectServer: ${JSON.stringify({ remoteAddress: sock.remoteAddress, data: rawData.toString('hex')})}`
    )

    // Return a _NPS_UserInfo structure
    const userInfo = new NPSUserInfo('Recieved')
    userInfo.deserialize(rawData)
    userInfo.dumpInfo()

    const personaManager = new PersonaServer(
      logger.child('PersonaServer')
    )

    const personas = personaManager._getPersonasById(userInfo.userId)
    if (personas.length === 0) {
      throw new Error('No personas found.')
    }
    const customerId = personas[0].customerId

    // Set the encryption keys on the lobby connection
    /** @type {Session_Record} */
    const keys = await databaseManager.fetchSessionKeyByCustomerId(customerId)
    const s = connection

    // Create the cypher and decipher only if not already set
    if (!s.encLobby.decipher) {
      try {
        s.setEncryptionKeyDES(keys.s_key)
      } catch (error) {
        throw new Error(`Unable to set session key: ${JSON.stringify({ keys, error })}`)
      }
    }

    const packetContent = Buffer.alloc(72)
    // const packetContent = Buffer.alloc(38);

    // this response is a NPS_UserStatus

    // Ban and Gag
    // Buffer.from([0x00]).copy(packetContent);
    // Buffer.from([0x00, 0x00]).copy(packetContent);

    // NPS_USERID - User ID - persona id - long
    Buffer.from([0x00, 0x84, 0x5f, 0xed]).copy(packetContent)

    // SessionKeyStr (32)
    this._generateSessionKeyBuffer(keys.session_key).copy(packetContent, 4)

    // // SessionKeyLen - int
    packetContent.writeInt16BE(32, 66)

    // // User name (32)
    // const name = Buffer.alloc(32);
    // Buffer.from("Doctor Brown", "utf8").copy(name);
    // name.copy(packetContent, 6);

    // // UserData - User controllable data (64)
    // Buffer.alloc(64).copy(packetContent, 38);

    // Build the packet
    const packetResult = new NPSMsg('Sent')
    packetResult.msgNo = 0x120
    packetResult.setContent(packetContent)
    packetResult.dumpPacket()

    return packetResult
  }
}

module.exports = {
  npsSocketWriteIfOpen,
  decryptCmd,
  encryptCmd,
  sendCommand,
  LobbyServer
}
