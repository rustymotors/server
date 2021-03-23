// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { debug } from 'debug'
import { ConnectionObj } from '../ConnectionObj'
import { IRawPacket, ISessionRecord } from '../../../types'
import { MessageNode, MESSAGE_DIRECTION } from './MessageNode'
import { logger } from '../../../shared/logger'
import { MCOTServer } from './MCOTServer'
import { ClientConnectMsg } from '../ClientConnectMsg'
import { GenericReplyMsg } from '../GenericReplyMsg'
import { GenericRequestMsg } from '../GenericRequestMsg'
import { StockCar } from './StockCar'
import { StockCarInfoMsg } from './StockCarInfoMsg'
import { DatabaseManager } from '../../../shared/DatabaseManager'

/**
 * Manages TCP connection packet processing
 * @module TCPManager
 */

const mcotServer = new MCOTServer(logger.child({ service: 'mcoserver:MCOTSServer' }))
const databaseManager = new DatabaseManager(
  logger.child({ service: 'mcoserver:DatabaseManager' })
)

/** */

/**
 *
 * @param {module:ConnectionObj} conn
 * @param {MessageNode} node
 */
export async function compressIfNeeded (conn: ConnectionObj, node:MessageNode): Promise<{conn: ConnectionObj, packetToWrite : MessageNode}> {
  const packetToWrite = node

  // Check if compression is needed
  if (node.getLength() < 80) {
    debug('mcoserver:TCPManager')('Too small, should not compress')
  } else {
    debug('mcoserver:TCPManager')('This packet should be compressed')
    /* TODO: Write compression.
     *
     * At this time we will still send the packet, to not hang connection
     * Client will crash though, due to memory access errors
     */
  }
  return { conn, packetToWrite }
}

/**
 *
 * @param {module:ConnectionObj} conn
 * @param {module:MessageNode} node
 */
async function encryptIfNeeded (conn:ConnectionObj, node:MessageNode) {
  let packetToWrite = node

  // Check if encryption is needed
  if (node.flags - 8 >= 0) {
    debug('mcoserver:TCPManager')('encryption flag is set')

    if (conn.enc) {
      node.updateBuffer(conn.enc.encrypt(node.data))
    } else {
      throw new Error('encryption out on connection is null')
    }
    packetToWrite = node
    debug('mcoserver:TCPManager')(`encrypted packet: ${packetToWrite.serialize().toString('hex')}`)
  }

  return { conn, packetToWrite }
}

/**
 *
 * @param {module:ConnectionObj} conn
 * @param {MessageNode[]} nodes
 */
export async function socketWriteIfOpen (conn:ConnectionObj, nodes:MessageNode[]): Promise<ConnectionObj> {
  const updatedConnection = conn
  nodes.forEach(async node => {
    const { packetToWrite: compressedPacket } = await compressIfNeeded(
      conn,
      node
    )
    const { packetToWrite } = await encryptIfNeeded(conn, compressedPacket)
    // Log that we are trying to write
    debug('mcoserver:TCPManager')(
      ` Atempting to write seq: ${packetToWrite.seq} to conn: ${updatedConnection.id}`
    )

    // Log the buffer we are writing
    debug('mcoserver:TCPManager')(`Writting buffer: ${packetToWrite.serialize().toString('hex')}`)
    if (conn.sock.writable) {
      // Write the packet to socket
      conn.sock.write(packetToWrite.serialize())
      // updatedConnection = encryptedResult.conn;
    } else {
      throw new Error(
        `Error writing ${packetToWrite.serialize()} to ${
          conn.sock.remoteAddress
        } , ${conn.sock.localPort.toString()}`
      )
    }
  })
  return updatedConnection
}

/**
 *
 * @param {module:ConnectionObj} con
 * @param {module:MessageNode} node
 */
export async function GetStockCarInfo (con:ConnectionObj, node:MessageNode): Promise<{con: ConnectionObj, nodes: MessageNode[]}> {
  const getStockCarInfoMsg = new GenericRequestMsg()
  getStockCarInfoMsg.deserialize(node.data)
  getStockCarInfoMsg.dumpPacket()

  const pReply = new StockCarInfoMsg(200, 0, 105)
  pReply.starterCash = 200
  pReply.dealerId = 8
  pReply.brand = 105

  pReply.addStockCar(new StockCar(113, 20, 0)) // Bel-air
  pReply.addStockCar(new StockCar(104, 15, 1)) // Fairlane - Deal of the day
  pReply.addStockCar(new StockCar(402, 20, 0)) // Century

  pReply.dumpPacket()

  const rPacket = new MessageNode(MESSAGE_DIRECTION.SENT)

  rPacket.deserialize(node.serialize())

  rPacket.updateBuffer(pReply.serialize())

  rPacket.dumpPacket()

  return { con, nodes: [rPacket] }
}

/**
 *
 * @param {module:ConnectionObj} con
 * @param {module:MessageNode} node
 */
export async function ClientConnect (con:ConnectionObj, node:MessageNode): Promise<{con: ConnectionObj, nodes: MessageNode[]}> {
  /**
   * Let's turn it into a ClientConnectMsg
   */
  // Not currently using this
  const newMsg = new ClientConnectMsg(node.data)

  debug('mcoserver:TCPManager')(`[TCPManager] Looking up the session key for ${newMsg.customerId}...`)
  /** @type {module:DatabaseManager.Session_Record} */
  const res:ISessionRecord = await databaseManager.fetchSessionKeyByCustomerId(
    newMsg.customerId
  )
  debug('mcoserver:TCPManager')(`[TCPManager] Session Key: ${res.sessionkey}`)

  const connectionWithKey = con

  const { customerId, personaId, personaName } = newMsg
  const sessionkey = res.sessionkey
  debug('mcoserver:TCPManager')(`Raw Session Key: ${sessionkey}`)

  const strKey = Buffer.from(sessionkey, 'hex')
  connectionWithKey.setEncryptionKey(Buffer.from(strKey.slice(0, 16)))

  // Update the connection's appId
  connectionWithKey.appId = newMsg.getAppId()

  // Log the session key
  debug('mcoserver:TCPManager')(
    `cust: ${customerId} ID: ${personaId} Name: ${personaName} SessionKey: ${strKey[0].toString(
      16
    )} ${strKey[1].toString(16)} ${strKey[2].toString(16)} ${strKey[3].toString(
      16
    )} ${strKey[4].toString(16)} ${strKey[5].toString(16)} ${strKey[6].toString(
      16
    )} ${strKey[7].toString(16)}`
  )

  // Create new response packet
  const pReply = new GenericReplyMsg()
  pReply.msgNo = 101
  pReply.msgReply = 438
  const rPacket = new MessageNode(MESSAGE_DIRECTION.SENT)
  rPacket.deserialize(node.serialize())
  rPacket.updateBuffer(pReply.serialize())
  rPacket.dumpPacket()

  return { con, nodes: [rPacket] }
}

/**
 * Route or process MCOTS commands
 */
export async function ProcessInput (node:MessageNode, conn:ConnectionObj): Promise<ConnectionObj> {
  const currentMsgNo = node.msgNo
  const currentMsgString = mcotServer._MSG_STRING(currentMsgNo)

  switch (currentMsgString) {
    case 'MC_SET_OPTIONS':
      try {
        const result = await mcotServer._setOptions(conn, node)
        const responsePackets = result.nodes
        const updatedConnection = await socketWriteIfOpen(
          result.con,
          responsePackets
        )
        return updatedConnection
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Error in MC_SET_OPTIONS: ${error}`)
        }
        throw new Error(`Error in MC_SET_OPTIONS, error unknown`)
      }
    case 'MC_TRACKING_MSG':
      try {
        const result = await mcotServer._trackingMessage(conn, node)
        const responsePackets = result.nodes
        const updatedConnection = await socketWriteIfOpen(
          result.con,
          responsePackets
        )
        return updatedConnection
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Error in MC_TRACKING_MSG: ${error}`)
        }
        throw new Error(`Error in MC_TRACKING_MSG, error unknown`)
      }
    case 'MC_UPDATE_PLAYER_PHYSICAL':
      try {
        const result = await mcotServer._updatePlayerPhysical(conn, node)
        const responsePackets = result.nodes
        const updatedConnection = await socketWriteIfOpen(
          result.con,
          responsePackets
        )
        return updatedConnection
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Error in MC_UPDATE_PLAYER_PHYSICAL: ${error}`)
        }
        throw new Error(`Error in MC_UPDATE_PLAYER_PHYSICAL, error unknown`)
      }

    default:
      break
  }

  if (currentMsgString === 'MC_CLIENT_CONNECT_MSG') {
    try {
      const result = await ClientConnect(conn, node)
      const responsePackets = result.nodes
      // write the socket
      return await socketWriteIfOpen(result.con, responsePackets)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`[TCPManager] Error writing to socket: ${error}`)
      }
      throw new Error(`[TCPManager] Error writing to socket, error unknown`)
    }
  } else if (currentMsgString === 'MC_LOGIN') {
    try {
      const result = await mcotServer._login(conn, node)
      const responsePackets = result.nodes
      // write the socket
      return await socketWriteIfOpen(result.con, responsePackets)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`[TCPManager] Error writing to socket: ${error}`)
      }
      throw new Error(`[TCPManager] Error writing to socket, error unknown`)
    }
  } else if (currentMsgString === 'MC_LOGOUT') {
    try {
      const result = await mcotServer._logout(conn, node)
      const responsePackets = result.nodes
      // write the socket
      return await socketWriteIfOpen(result.con, responsePackets)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`[TCPManager] Error writing to socket: ${error}`)
      }
      throw new Error(`[TCPManager] Error writing to socket, error unknown`)
    }
  } else if (currentMsgString === 'MC_GET_LOBBIES') {
    const result = await mcotServer._getLobbies(conn, node)
    debug('mcoserver:TCPManager')('Dumping Lobbies response packet...')
    debug('mcoserver:TCPManager')(result.nodes)
    const responsePackets = result.nodes
    try {
      // write the socket
      return await socketWriteIfOpen(result.con, responsePackets)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`[TCPManager] Error writing to socket: ${error}`)
      }
      throw new Error(`[TCPManager] Error writing to socket, error unknown`)
    }
  } else if (currentMsgString === 'MC_STOCK_CAR_INFO') {
    try {
      const result = await GetStockCarInfo(conn, node)
      const responsePackets = result.nodes
      // write the socket
      return await socketWriteIfOpen(result.con, responsePackets)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`[TCPManager] Error writing to socket: ${error}`)
      }
      throw new Error(`[TCPManager] Error writing to socket, error unknown`)
    }
  } else {
    node.setAppId(conn.appId)
    throw new Error(`Message Number Not Handled: ${currentMsgNo} (${currentMsgString})
      conID: ${node.toFrom}  PersonaID: ${node.appId}`)
  }
}

/**
 *
 * @param {module:MessageNode} msg
 * @param {module:ConnectionObj} con
 */
export async function MessageReceived (msg:MessageNode, con:ConnectionObj): Promise<ConnectionObj> {
  const newConnection = con
  if (!newConnection.useEncryption && msg.flags && 0x08) {
    debug('mcoserver:TCPManager')('Turning on encryption')
    newConnection.useEncryption = true
  }

  // If not a Heartbeat
  if (msg.flags !== 80 && newConnection.useEncryption) {
    if (!newConnection.isSetupComplete) {
      throw new Error(
        `Decrypt() not yet setup! Disconnecting...conId: ${con.id}`
      )
    }

    if (msg.flags - 8 >= 0) {
      try {
        /**
         * Attempt to decrypt message
         */
        const encryptedBuffer = Buffer.from(msg.data)
        debug('mcoserver:TCPManager')(
          `Full packet before decrypting: ${encryptedBuffer.toString('hex')}`
        )

        debug('mcoserver:TCPManager')(
          `Message buffer before decrypting: ${encryptedBuffer.toString('hex')}`
        )
        if (!newConnection.enc) {
          throw new Error('ARC4 decrypter is null')
        }
        debug('mcoserver:TCPManager')(`Using encryption id: ${newConnection.enc.getId()}`)
        const deciphered = newConnection.enc.decrypt(encryptedBuffer)
        debug('mcoserver:TCPManager')(
          `Message buffer after decrypting: ${deciphered.toString('hex')}`
        )

        if (deciphered.readUInt16LE(0) <= 0) {
          throw new Error('Failure deciphering message, exiting.')
        }

        // Update the MessageNode with the deciphered buffer
        msg.updateBuffer(deciphered)
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(
            `Decrypt() exception thrown! Disconnecting...conId:${newConnection.id}: ${e}`
          )
        }
        throw new Error(
          `Decrypt() exception thrown! Disconnecting...conId:${newConnection.id}, error unknown`
        )
      }
    }
  }

  // Should be good to process now
  return await ProcessInput(msg, newConnection)
}

/**
 *
 * @param {module:ListenerThread/IRawPacket} rawPacket
 * @return {Promise<{module:ConnectionObj}>}
 */
export async function defaultHandler (rawPacket:IRawPacket): Promise<ConnectionObj> {
  const { connection, remoteAddress, localPort, data } = rawPacket
  const messageNode = new MessageNode(MESSAGE_DIRECTION.RECIEVED)
  messageNode.deserialize(data)

  logger.info(
    'Received TCP packet',
    {
      localPort,
      remoteAddress,
      direction: messageNode.direction,
      data: rawPacket.data.toString('hex')
    }
  )

  messageNode.dumpPacket()

  const newMessage = await MessageReceived(messageNode, connection)
  return newMessage
}
