// @ts-check
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { DatabaseManager } from 'mcos-database'
import { getPersonasByPersonaId } from 'mcos-persona'
import { errorMessage } from 'mcos-shared'
import { cipherBufferDES, decipherBufferDES, selectOrCreateEncryptors } from 'mcos-shared/encryption'
import { logger } from 'mcos-shared/logger'
import { NPSMessage, NPSUserInfo } from 'mcos-shared/types'

const log = logger.child({ service: 'mcoserver:LobbyServer' })

/**
 * Manages the game connection to the lobby and racing rooms
 * @module LobbyServer
 */

/**
 * @param {import("mcos-core").TCPConnection} conn
 * @param {Buffer} buffer
 * @return {import("mcos-core").TCPConnection}
 */
// function npsSocketWriteIfOpen (conn, buffer) {
//   const { sock } = conn
//   if (sock.writable) {
//     // Write the packet to socket
//     sock.write(buffer)
//   } else {
//     throw new Error(
//       `Error writing ${buffer.toString('hex')} to ${
//         sock.remoteAddress
//       } , ${String(sock)}`
//     )
//   }

//   return conn
// }

/**
 * Takes an encrypted command packet and returns the decrypted bytes
 *
 * @return {import('mcos-shared/types').BufferWithConnection}
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @param {Buffer} encryptedCommand
 */
function decryptCmd (dataConnection, encryptedCommand) {
  if (typeof dataConnection.connection.encryptionSession === 'undefined') {
    const errMessage = `Unable to locate encryption session for connection id ${dataConnection.connectionId}`
    log.error(errMessage)
    throw new Error(errMessage)
  }
  const result = decipherBufferDES(dataConnection.connection.encryptionSession, encryptedCommand)
  log.debug(`[Deciphered Cmd: ${result.data.toString('hex')}`)
  dataConnection.connection.encryptionSession = result.session
  dataConnection.data = result.data
  return dataConnection
}

/**
 * Takes an plaintext command packet and return the encrypted bytes
 *
 * @return {import('mcos-shared/types').BufferWithConnection}
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @param {Buffer} plaintextCommand
 */
function encryptCmd (dataConnection, plaintextCommand) {
  if (typeof dataConnection.connection.encryptionSession === 'undefined') {
    const errMessage = `Unable to locate encryption session for connection id ${dataConnection.connectionId}`
    log.error(errMessage)
    throw new Error(errMessage)
  }

  const result = cipherBufferDES(dataConnection.connection.encryptionSession, plaintextCommand)
  log.debug(`[ciphered Cmd: ${result.data.toString('hex')}`)
  dataConnection.connection.encryptionSession = result.session
  dataConnection.data = result.data
  return dataConnection
}

/**
 * Takes a plaintext command packet, encrypts it, and sends it across the connection's socket
 *
 * @param {import("mcos-core").TCPConnection} con
 * @param {Buffer} data
 * @return {import("mcos-core").TCPConnection}
 */
// function sendCommand (con, data) {

//   // Marshal the command into an NPS packet
//   const incommingRequest = new NPSMessage('recieved')
//   incommingRequest.deserialize(decipheredCommand)

//   incommingRequest.dumpPacket()

//   // Create the packet content
//   const packetContent = Buffer.alloc(375)

//   // Add the response code
//   packetContent.writeUInt16BE(0x02_19, 367)
//   packetContent.writeUInt16BE(0x01_01, 369)
//   packetContent.writeUInt16BE(0x02_2c, 371)

//   log.debug('Sending a dummy response of 0x229 - NPS_MINI_USER_LIST')

//   // Build the packet
//   const packetResult = new NPSMessage('sent')
//   packetResult.msgNo = 0x2_29
//   packetResult.setContent(packetContent)
//   packetResult.dumpPacket()

//   const cmdEncrypted = encryptCmd(s, packetResult.getContentAsBuffer())

//   if (cmdEncrypted.encryptedCmd === undefined) {
//     throw new Error('There was an error ciphering the NPS command')
//   }

//   cmdEncrypted.encryptedCmd = Buffer.concat([
//     Buffer.from([0x11, 0x01]),
//     cmdEncrypted.encryptedCmd
//   ])

//   return cmdEncrypted
// }

/**
 * Please use {@link LobbyServer.getInstance()}
 * @classdesc
 */
// export class LobbyServer {
//   /**
//    *
//    *
//    * @static
//    * @type {LobbyServer}
//    * @memberof LobbyServer
//    */
//   static _instance
//   /**
//    * Get the single instance of the lobby service
//    *
//    * @static
//    * @return {LobbyServer}
//    * @memberof LobbyServer
//    */
//   static getInstance () {
//     if (!LobbyServer._instance) {
//       LobbyServer._instance = new LobbyServer()
//     }
//     return LobbyServer._instance
//   }

// }

/**
   * @param {string} key
   * @return {Buffer}
   */
function _generateSessionKeyBuffer (key) {
  const nameBuffer = Buffer.alloc(64)
  Buffer.from(key, 'utf8').copy(nameBuffer)
  return nameBuffer
}

/**
   * Handle a request to connect to a game server packet
   *
   * @private
   * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
   * @return {Promise<NPSMessage>}
   */
async function _npsRequestGameConnectServer (dataConnection) {
  log.debug(
    `_npsRequestGameConnectServer: ${JSON.stringify({
      remoteAddress: dataConnection.connection.socket.remoteAddress,
      data: dataConnection.data.toString('hex')
    })}`
  )

  // Return a _NPS_UserInfo structure
  const userInfo = new NPSUserInfo('recieved')
  userInfo.deserialize(dataConnection.data)
  userInfo.dumpInfo()

  const personas = await getPersonasByPersonaId(
    userInfo.userId
  )
  if (typeof personas[0] === 'undefined') {
    throw new Error('No personas found.')
  }

  const { customerId } = personas[0]

  // Set the encryption keys on the lobby connection
  const databaseManager = DatabaseManager.getInstance()
  const keys = await databaseManager
    .fetchSessionKeyByCustomerId(customerId)
    .catch((/** @type {unknown} */ error) => {
      if (error instanceof Error) {
        log.debug(
          `Unable to fetch session key for customerId ${customerId.toString()}: ${
            error.message
          })}`
        )
      }
      log.error(
        `Unable to fetch session key for customerId ${customerId.toString()}: unknown error}`
      )
      return undefined
    })
  if (keys === undefined) {
    throw new Error('Error fetching session keys!')
  }

  /** @type {import('mcos-shared/types').EncryptionSession} */
  const encryptionSession = selectOrCreateEncryptors(dataConnection, keys)

  dataConnection.connection.encryptionSession = encryptionSession

  const packetContent = Buffer.alloc(72)

  // This response is a NPS_UserStatus

  // Ban and Gag

  // NPS_USERID - User ID - persona id - long
  Buffer.from([0x00, 0x84, 0x5f, 0xed]).copy(packetContent)

  // SessionKeyStr (32)
  _generateSessionKeyBuffer(keys.sessionkey).copy(packetContent, 4)

  // SessionKeyLen - int
  packetContent.writeInt16BE(32, 66)

  // Build the packet
  const packetResult = new NPSMessage('sent')
  packetResult.msgNo = 0x1_20
  packetResult.setContent(packetContent)
  packetResult.dumpPacket()

  return packetResult
}

/**
   * @private
   * @return {NPSMessage}}
   */
function _npsHeartbeat () {
  const packetContent = Buffer.alloc(8)
  const packetResult = new NPSMessage('sent')
  packetResult.msgNo = 0x1_27
  packetResult.setContent(packetContent)
  packetResult.dumpPacket()
  return packetResult
}

/**
 *
 *
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {import('mcos-shared/types').BufferWithConnection}
 */
function handleEncryptedNPSCommand (dataConnection) {
  // Decipher
  const { data } = dataConnection
  const decipheredConnection = decryptCmd(dataConnection,
    Buffer.from(data.slice(4))
  )

  const responseConnection = handleCommand(decipheredConnection)

  // Encipher
  const encipheredConnection = encryptCmd(responseConnection, responseConnection.data)

  return encipheredConnection
}

/**
   * @param {import("mcos-shared/types").BufferWithConnection} dataConnection
   * @return {Promise<import('mcos-shared/types').BufferWithConnection>}
   */
async function handleData (dataConnection) {
  const { localPort, remoteAddress } = dataConnection.connection.socket
  log.debug(
    `Received Lobby packet: ${JSON.stringify({ localPort, remoteAddress })}`
  )
  const { data } = dataConnection
  const requestCode = data.readUInt16BE(0).toString(16)

  switch (requestCode) {
    // _npsRequestGameConnectServer
    case '100': {
      const responsePacket = await _npsRequestGameConnectServer(
        dataConnection
      )
      dataConnection.data = responsePacket.serialize()
      return dataConnection
    }

    // NpsHeartbeat

    case '217': {
      const responsePacket = _npsHeartbeat()
      dataConnection.data = responsePacket.serialize()
      return dataConnection
    }

    // NpsSendCommand

    case '1101': {
      // This is an encrypted command

      const result = handleEncryptedNPSCommand(dataConnection)
      return result
    }

    default:
      throw new Error(
        `Unknown code ${requestCode} was received on port 7003`
      )
  }
}

/**
 * Entry and exit point for the lobby service
 *
 * @export
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {Promise<import('mcos-shared/types').ServiceResponse>}
 */
export async function receiveLobbyData (dataConnection) {
  try {
    return { errMessage: null, data: await handleData(dataConnection) }
  } catch (error) {
    const errMessage = `There was an error in the lobby service: ${errorMessage(error)}`
    return { errMessage, data: null }
  }
}

/**
 *
 *
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {import('mcos-shared/types').BufferWithConnection}
 */
function handleCommand (dataConnection) {
  const { data } = dataConnection

  // Marshal the command into an NPS packet
  const incommingRequest = new NPSMessage('recieved')
  incommingRequest.deserialize(data)

  incommingRequest.dumpPacket()

  // Create the packet content
  const packetContent = Buffer.alloc(375)

  // Add the response code
  packetContent.writeUInt16BE(0x02_19, 367)
  packetContent.writeUInt16BE(0x01_01, 369)
  packetContent.writeUInt16BE(0x02_2c, 371)

  log.debug('Sending a dummy response of 0x229 - NPS_MINI_USER_LIST')

  // Build the packet
  const packetResult = new NPSMessage('sent')
  packetResult.msgNo = 0x2_29
  packetResult.setContent(packetContent)
  packetResult.dumpPacket()

  dataConnection.data = packetResult.serialize()
  return dataConnection
}
