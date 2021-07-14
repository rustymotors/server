// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { log } from '@drazisil/mco-logger'
import { ClientConnectMessage } from '../MCServer/client-connect-msg'
import { GenericReplyMessage } from '../MCServer/generic-reply-msg'
import { GenericRequestMessage } from '../MCServer/generic-request-msg'
import { DatabaseManager } from '../shared/database-manager'
import { StockCar } from './stock-car'
import { StockCarInfoMessage } from './stock-car-info-msg'
import { MCOTServer } from './mcots-server'
import { MessageNode } from './message-node'
import { TCPConnection } from '../MCServer/tcpConnection'
import { IRawPacket } from '../../types'

/**
 * Manages TCP connection packet processing
 * @module TCPManager
 */

const mcotServer = new MCOTServer()
const databaseManager = new DatabaseManager()

/**
 *
 * @param {ConnectionObj} conn
 * @param {MessageNode} node
 * @returns {Promise<{conn: ConnectionObj, packetToWrite: MessageNode}>}
 */
async function compressIfNeeded(conn: TCPConnection, node: MessageNode) {
  const packetToWrite = node

  // Check if compression is needed
  if (node.getLength() < 80) {
    log('Too small, should not compress', {
      service: 'mcoserver:MCOTSServer',
      level: 'debug',
    })
  } else {
    log('This packet should be compressed', {
      service: 'mcoserver:MCOTSServer',
      level: 'debug',
    })
    /* TODO: Write compression.
     *
     * At this time we will still send the packet, to not hang connection
     * Client will crash though, due to memory access errors
     */
  }

  return { conn, packetToWrite }
}

const _compressIfNeeded = compressIfNeeded
export { _compressIfNeeded as compressIfNeeded }

/**
 *
 * @param {ConnectionObj} conn
 * @param {MessageNode} node
 * @returns {Promise<{conn: ConnectionObj, packetToWrite: MessageNode}>}
 */
async function encryptIfNeeded(conn: TCPConnection, node: MessageNode) {
  let packetToWrite = node

  // Check if encryption is needed
  if (node.flags - 8 >= 0) {
    log('encryption flag is set', {
      service: 'mcoserver:MCOTSServer',
      level: 'debug',
    })

    if (conn.enc) {
      node.updateBuffer(conn.enc.encrypt(node.data))
    } else {
      throw new Error('encryption out on connection is null')
    }

    packetToWrite = node
    log(`encrypted packet: ${packetToWrite.serialize().toString('hex')}`, {
      service: 'mcoserver:MCOTSServer',
      level: 'debug',
    })
  }

  return { conn, packetToWrite }
}

/**
 *
 * @param {ConnectionObj} connection
 * @param {MessageNode[]} nodes
 * @returns {Promise<ConnectionObj>}
 */
async function socketWriteIfOpen(connection: TCPConnection, nodes: MessageNode[]) {
  const updatedConnection = connection
  // For each node in nodes
  for (const node of nodes) {
    // Does the packet need to be compressed?
    const { packetToWrite: compressedPacket } = await compressIfNeeded(
      connection,
      node,
    )
    // Does the packet need to be encrypted?
    const { packetToWrite } = await encryptIfNeeded(
      connection,
      compressedPacket,
    )
    // Log that we are trying to write
    log(
      ` Atempting to write seq: ${packetToWrite.seq} to conn: ${updatedConnection.id}`,
      { service: 'mcoserver:MCOTSServer', level: 'debug' },
    )

    // Log the buffer we are writing
    log(`Writting buffer: ${packetToWrite.serialize().toString('hex')}`, {
      service: 'mcoserver:MCOTSServer',
      level: 'debug',
    })
    if (connection.sock.writable) {
      // Write the packet to socket
      connection.sock.write(packetToWrite.serialize())
    } else {
      throw new Error(
        `Error writing ${packetToWrite.serialize()} to ${
          connection.sock.remoteAddress
        } , ${connection.sock.localPort.toString()}`,
      )
    }
  }

  return updatedConnection
}

const _socketWriteIfOpen = socketWriteIfOpen
export { _socketWriteIfOpen as socketWriteIfOpen }

/**
 *
 * @param {ConnectionObj} connection
 * @param {MessageNode} node
 * @returns {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
 */
async function getStockCarInfo(connection: TCPConnection, node: MessageNode) {
  const getStockCarInfoMessage = new GenericRequestMessage()
  getStockCarInfoMessage.deserialize(node.data)
  getStockCarInfoMessage.dumpPacket()

  const stockCarInfoMessage = new StockCarInfoMessage(200, 0, 105)
  stockCarInfoMessage.starterCash = 200
  stockCarInfoMessage.dealerId = 8
  stockCarInfoMessage.brand = 105

  stockCarInfoMessage.addStockCar(new StockCar(113, 20, 0)) // Bel-air
  stockCarInfoMessage.addStockCar(new StockCar(104, 15, 1)) // Fairlane - Deal of the day
  stockCarInfoMessage.addStockCar(new StockCar(402, 20, 0)) // Century

  stockCarInfoMessage.dumpPacket()

  const responsePacket = new MessageNode('SENT')

  responsePacket.deserialize(node.serialize())

  responsePacket.updateBuffer(stockCarInfoMessage.serialize())

  responsePacket.dumpPacket()

  return { con: connection, nodes: [responsePacket] }
}

const _GetStockCarInfo = getStockCarInfo
export { _GetStockCarInfo as GetStockCarInfo }

/**
 *
 * @param {ConnectionObj} connection
 * @param {MessageNode} node
 * @returns {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
 */
async function clientConnect(connection: TCPConnection, node: MessageNode) {
  /**
   * Let's turn it into a ClientConnectMsg
   */
  // Not currently using this
  const newMessage = new ClientConnectMessage(node.data)

  log(
    `[TCPManager] Looking up the session key for ${newMessage.customerId}...`,
    { service: 'mcoserver:MCOTSServer', level: 'debug' },
  )
  const result = await databaseManager.fetchSessionKeyByCustomerId(
    newMessage.customerId,
  )
  log('[TCPManager] Session Key located!', {
    service: 'mcoserver:MCOTSServer',
    level: 'debug',
  })

  const connectionWithKey = connection

  const { customerId, personaId, personaName } = newMessage
  const { sessionkey } = result

  const stringKey = Buffer.from(sessionkey, 'hex')
  connectionWithKey.setEncryptionKey(Buffer.from(stringKey.slice(0, 16)))

  // Update the connection's appId
  connectionWithKey.appId = newMessage.getAppId()

  // Log the session key
  log(`cust: ${customerId} ID: ${personaId} Name: ${personaName}`, {
    service: 'mcoserver:MCOTSServer',
    level: 'debug',
  })

  // Create new response packet
  const genericReplyMessage = new GenericReplyMessage()
  genericReplyMessage.msgNo = 101
  genericReplyMessage.msgReply = 438
  const responsePacket = new MessageNode('SENT')
  responsePacket.deserialize(node.serialize())
  responsePacket.updateBuffer(genericReplyMessage.serialize())
  responsePacket.dumpPacket()

  return { con: connection, nodes: [responsePacket] }
}

/**
 * Route or process MCOTS commands
 * @param {MessageNode} node
 * @param {ConnectionObj} conn
 * @returns {Promise<ConnectionObj>}
 */
async function processInput(node: MessageNode, conn: TCPConnection) {
  const currentMessageNo = node.msgNo
  const currentMessageString = mcotServer._MSG_STRING(currentMessageNo)

  switch (currentMessageString) {
    case 'MC_SET_OPTIONS':
      try {
        const result = await mcotServer._setOptions(conn, node)
        const responsePackets = result.nodes
        return await _socketWriteIfOpen(result.con, responsePackets)
      } catch (error) {
        if (error instanceof Error) {
          throw new TypeError(`Error in MC_SET_OPTIONS: ${error}`)
        }

        throw new Error('Error in MC_SET_OPTIONS, error unknown')
      }

    case 'MC_TRACKING_MSG':
      try {
        const result = await mcotServer._trackingMessage(conn, node)
        const responsePackets = result.nodes
        return _socketWriteIfOpen(result.con, responsePackets)
      } catch (error) {
        if (error instanceof Error) {
          throw new TypeError(`Error in MC_TRACKING_MSG: ${error}`)
        }

        throw new Error('Error in MC_TRACKING_MSG, error unknown')
      }

    case 'MC_UPDATE_PLAYER_PHYSICAL':
      try {
        const result = await mcotServer._updatePlayerPhysical(conn, node)
        const responsePackets = result.nodes
        return _socketWriteIfOpen(result.con, responsePackets)
      } catch (error) {
        if (error instanceof Error) {
          throw new TypeError(`Error in MC_UPDATE_PLAYER_PHYSICAL: ${error}`)
        }

        throw new Error('Error in MC_UPDATE_PLAYER_PHYSICAL, error unknown')
      }

    case 'MC_CLIENT_CONNECT_MSG': {
      try {
        const result = await clientConnect(conn, node)
        const responsePackets = result.nodes
        // Write the socket
        return await socketWriteIfOpen(result.con, responsePackets)
      } catch (error) {
        if (error instanceof Error) {
          throw new TypeError(`[TCPManager] Error writing to socket: ${error}`)
        }

        throw new Error('[TCPManager] Error writing to socket, error unknown')
      }
    }

    case 'MC_LOGIN': {
      try {
        const result = await mcotServer._login(conn, node)
        const responsePackets = result.nodes
        // Write the socket
        return socketWriteIfOpen(result.con, responsePackets)
      } catch (error) {
        if (error instanceof Error) {
          throw new TypeError(`[TCPManager] Error writing to socket: ${error}`)
        }

        throw new Error('[TCPManager] Error writing to socket, error unknown')
      }
    }

    case 'MC_LOGOUT': {
      try {
        const result = await mcotServer._logout(conn, node)
        const responsePackets = result.nodes
        // Write the socket
        return await socketWriteIfOpen(result.con, responsePackets)
      } catch (error) {
        if (error instanceof Error) {
          throw new TypeError(`[TCPManager] Error writing to socket: ${error}`)
        }

        throw new Error('[TCPManager] Error writing to socket, error unknown')
      }
    }

    case 'MC_GET_LOBBIES': {
      const result = await mcotServer._getLobbies(conn, node)
      log('Dumping Lobbies response packet...', {
        service: 'mcoserver:MCOTSServer',
        level: 'debug',
      })
      log(result.nodes, { service: 'mcoserver:MCOTSServer', level: 'debug' })
      const responsePackets = result.nodes
      try {
        // Write the socket
        return await socketWriteIfOpen(result.con, responsePackets)
      } catch (error) {
        if (error instanceof Error) {
          throw new TypeError(`[TCPManager] Error writing to socket: ${error}`)
        }

        throw new Error('[TCPManager] Error writing to socket, error unknown')
      }
    }

    case 'MC_STOCK_CAR_INFO': {
      try {
        const result = await getStockCarInfo(conn, node)
        const responsePackets = result.nodes
        // Write the socket
        return socketWriteIfOpen(result.con, responsePackets)
      } catch (error) {
        if (error instanceof Error) {
          throw new TypeError(`[TCPManager] Error writing to socket: ${error}`)
        }

        throw new Error('[TCPManager] Error writing to socket, error unknown')
      }
    }

    default: {
      node.setAppId(conn.appId)
      throw new Error(`Message Number Not Handled: ${currentMessageNo} (${currentMessageString})
      conID: ${node.toFrom}  PersonaID: ${node.appId}`)
    }
  }
}

/**
 *
 * @param {MessageNode} msg
 * @param {ConnectionObj} con
 * @returns {Promise<ConnectionObj>}
 */
async function messageReceived(message: MessageNode, con: TCPConnection) {
  const newConnection = con
  if (!newConnection.useEncryption && message.flags && 0x08) {
    log('Turning on encryption', {
      service: 'mcoserver:MCOTSServer',
      level: 'debug',
    })
    newConnection.useEncryption = true
  }

  // If not a Heartbeat
  if (message.flags !== 80 && newConnection.useEncryption) {
    if (!newConnection.isSetupComplete) {
      throw new Error(
        `Decrypt() not yet setup! Disconnecting...conId: ${con.id}`,
      )
    }

    if (message.flags - 8 >= 0) {
      try {
        /**
         * Attempt to decrypt message
         */
        const encryptedBuffer = Buffer.from(message.data)
        log(
          `Full packet before decrypting: ${encryptedBuffer.toString('hex')}`,
          { service: 'mcoserver:MCOTSServer', level: 'debug' },
        )

        log(
          `Message buffer before decrypting: ${encryptedBuffer.toString(
            'hex',
          )}`,
          { service: 'mcoserver:MCOTSServer', level: 'debug' },
        )
        if (!newConnection.enc) {
          throw new Error('ARC4 decrypter is null')
        }

        log(`Using encryption id: ${newConnection.enc.getId()}`, {
          service: 'mcoserver:MCOTSServer',
          level: 'debug',
        })
        const deciphered = newConnection.enc.decrypt(encryptedBuffer)
        log(`Message buffer after decrypting: ${deciphered.toString('hex')}`, {
          service: 'mcoserver:MCOTSServer',
          level: 'debug',
        })

        if (deciphered.readUInt16LE(0) <= 0) {
          throw new Error('Failure deciphering message, exiting.')
        }

        // Update the MessageNode with the deciphered buffer
        message.updateBuffer(deciphered)
      } catch (error) {
        if (error instanceof Error) {
          throw new TypeError(
            `Decrypt() exception thrown! Disconnecting...conId:${newConnection.id}: ${error}`,
          )
        }

        throw new Error(
          `Decrypt() exception thrown! Disconnecting...conId:${newConnection.id}, error unknown`,
        )
      }
    }
  }

  // Should be good to process now
  return processInput(message, newConnection)
}

/**
 *
 * @param {IRawPacket} rawPacket
 * @return {Promise<ConnectionObj>}
 */
async function defaultHandler(rawPacket: IRawPacket) {
  const { connection, remoteAddress, localPort, data } = rawPacket
  const messageNode = new MessageNode('RECEIVED')
  messageNode.deserialize(data)

  log(
    `Received TCP packet',
    ${{
      localPort,
      remoteAddress,
      direction: messageNode.direction,
      data: rawPacket.data.toString('hex'),
    }}`,
    { service: 'mcoserver:MCOTSServer' },
  )
  messageNode.dumpPacket()

  return messageReceived(messageNode, connection)
}

const _defaultHandler = defaultHandler
export { _defaultHandler as defaultHandler }
