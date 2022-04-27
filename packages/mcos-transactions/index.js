// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { errorMessage } from 'mcos-shared'
import { decryptBuffer } from 'mcos-shared/encryption'
import { logger } from 'mcos-shared/logger'
import { MessageNode } from 'mcos-shared/types'
import { messageHandlers } from './handlers.js'

const log = logger.child({ service: 'mcos:transactions' })

/**
   * Return the string representation of the numeric opcode
   *
   * @param {number} messageID
   * @return {string}
   */
function _MSG_STRING (messageID) {
  const messageIds = [
    { id: 105, name: 'MC_LOGIN' },
    { id: 106, name: 'MC_LOGOUT' },
    { id: 109, name: 'MC_SET_OPTIONS' },
    { id: 141, name: 'MC_STOCK_CAR_INFO' },
    { id: 213, name: 'MC_LOGIN_COMPLETE' },
    { id: 266, name: 'MC_UPDATE_PLAYER_PHYSICAL' },
    { id: 324, name: 'MC_GET_LOBBIES' },
    { id: 325, name: 'MC_LOBBIES' },
    { id: 438, name: 'MC_CLIENT_CONNECT_MSG' },
    { id: 440, name: 'MC_TRACKING_MSG' }
  ]

  const result = messageIds.find((id) => id.id === messageID)

  if (typeof result !== 'undefined') {
    return result.name
  }

  return 'Unknown'
}

/**
   *
   *
   * @param {import('mcos-shared/types').MessageNode} message
   * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
   * @return {boolean}
   */
function shouldMessageBeEncrypted (message, dataConnection) {
  return message.flags !== 80 && dataConnection.connection.useEncryption
}

/**
   *
   *
   * @param {import('mcos-shared/types').MessageNode} message
   * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
   * @return {{err: Error | null, data: Buffer | null}}
   */
function decryptTransactionBuffer (message, dataConnection) {
  const encryptedBuffer = Buffer.from(message.data)
  log.debug(
          `Full packet before decrypting: ${encryptedBuffer.toString('hex')}`
  )

  log.debug(
          `Message buffer before decrypting: ${encryptedBuffer.toString('hex')}`
  )

  const result = decryptBuffer(dataConnection, encryptedBuffer)
  log.debug(`Message buffer after decrypting: ${result.data.toString('hex')}`)

  if (result.data.readUInt16LE(0) <= 0) {
    return {
      err: new Error('Failure deciphering message, exiting.'),
      data: null
    }
  }
  return { err: null, data: result.data }
}

/**
   *
   *
   * @param {import('mcos-shared/types').MessageNode} message
   * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
   * @return {{err: Error | null, data: Buffer | null}}
   */
function tryDecryptBuffer (message, dataConnection) {
  try {
    return {
      err: null,
      data: decryptTransactionBuffer(message, dataConnection).data
    }
  } catch (error) {
    return {
      err: new Error(
              `Decrypt() exception thrown! Disconnecting...conId:${
                dataConnection.connectionId
              }: ${errorMessage(error)}`
      ),
      data: null
    }
  }
}

/**
   * Route or process MCOTS commands
   * @param {MessageNode} node
   * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
   * @return {Promise<{errMessage: string | null, data: import('mcos-shared/types').BufferWithConnection | null}>}
   */
async function processInput (node, dataConnection) {
  const currentMessageNo = node.msgNo
  const currentMessageString = _MSG_STRING(currentMessageNo)

  log.debug(
      `We are attempting to process a message with id ${currentMessageNo}(${currentMessageString})`
  )

  const result = messageHandlers.find(
    (msg) => msg.name === currentMessageString
  )

  if (typeof result !== 'undefined') {
    try {
      const responsePackets = await result.handler(conn, node)
      return {
        errMessage: null,
        data: responsePackets
      }
    } catch (error) {
      return {
        errMessage: `${result.errorMessage}: ${String(error)}`,
        data: null
      }
    }
  }

  node.setAppId(conn.appId)
  return {
    errMessage: `Message Number Not Handled: ${currentMessageNo} (${currentMessageString})
      conID: ${node.toFrom}  PersonaID: ${node.appId}`,
    data: null
  }
}

/**
   * @param {MessageNode} message
   * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
   * @return {Promise<{errMessage: string | null, data: import('mcos-shared/types').BufferWithConnection | null}>}
   */
async function messageReceived (message, dataConnection) {
  // if (message.flags && 0x08) {
  //     selectEncryptors(dataConnection.)
  //   log.debug('Turning on encryption')
  //   newConnection.useEncryption = true
  // }

  // If not a Heartbeat
  if (shouldMessageBeEncrypted(message, dataConnection)) {
    if (typeof dataConnection.connection.encryptionSession === 'undefined') {
      const errMessage = `Unabel to locate the encryptors on connection id ${dataConnection.connectionId}`
      log.error(errMessage)
      throw new Error(errMessage)
    }

    if (message.flags - 8 >= 0) {
      const result = tryDecryptBuffer(message, dataConnection)
      if (result.err || result.data === null) {
        return { errMessage: errorMessage(result.err), data: null }
      }
      // Update the MessageNode with the deciphered buffer
      message.updateBuffer(result.data)
    }
  }

  log.debug('Calling processInput()')
  return processInput(message, dataConnection)
}

/**
   * @param {import("mcos-shared/types").BufferWithConnection} dataConnection
   * @return {Promise<import('mcos-shared/types').TSMessageArrayWithConnection>}
   */
async function handleData (dataConnection) {
  const { connection, data } = dataConnection
  const { remoteAddress, localPort } = connection.socket
  const messageNode = new MessageNode('recieved')
  messageNode.deserialize(data)

  log.debug(
      `Received TCP packet',
    ${JSON.stringify({
      localPort,
      remoteAddress,
      direction: messageNode.direction,
      data: data.toString('hex')
    })}`
  )
  messageNode.dumpPacket()

  const processedPacket = await messageReceived(messageNode, dataConnection)
  log.debug('Back in transacation server')

  if (processedPacket.errMessage || processedPacket.data === null) {
    const errMessage = `Error processing packet: ${processedPacket.errMessage}`
    log.error(errMessage)
    throw new Error(errMessage)
  }

  return processedPacket.data
}

/**
 * Entry and exit point for the lobby service
 *
 * @export
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {Promise<import('mcos-shared/types').TServiceResponse>}
 */
export async function receiveTransactionsData (dataConnection) {
  try {
    const result = await handleData(dataConnection)
    log.debug('Exiting the transactions service')
    return { err: null, response: result }
  } catch (error) {
    const errMessage = `There was an error in the lobby service: ${errorMessage(error)}`
    return { err: new Error(errMessage), response: undefined }
  }
}
