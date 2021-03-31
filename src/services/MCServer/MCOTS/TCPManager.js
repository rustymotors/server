// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { debug } = require('debug')
const { ConnectionObj } = require('../ConnectionObj')
const { MessageNode, MESSAGE_DIRECTION } = require('./MessageNode')
const { logger } = require('../../../shared/logger')
const { MCOTServer } = require('./MCOTServer')
const { ClientConnectMsg } = require('../ClientConnectMsg')
const { GenericReplyMsg } = require('../GenericReplyMsg')
const { GenericRequestMsg } = require('../GenericRequestMsg')
const { StockCar } = require('./StockCar')
const { StockCarInfoMsg } = require('./StockCarInfoMsg')
const { DatabaseManager } = require('../../../shared/DatabaseManager')

/**
 * Manages TCP connection packet processing
 * @module TCPManager
 */

const mcotServer = new MCOTServer(logger.child({ service: 'mcoserver:MCOTSServer' }))
const databaseManager = new DatabaseManager(
  logger.child({ service: 'mcoserver:DatabaseManager' })
)

/**
 *
 * @param {ConnectionObj} conn
 * @param {MessageNode} node
 * @returns {Promise<{conn: ConnectionObj, packetToWrite: MessageNode}>}
 */
async function compressIfNeeded (conn, node) {
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
module.exports.compressIfNeeded = compressIfNeeded

/**
 *
 * @param {ConnectionObj} conn
 * @param {MessageNode} node
 * @returns {Promise<{conn: ConnectionObj, packetToWrite: MessageNode}>}
 */
async function encryptIfNeeded (conn, node) {
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
 * @param {ConnectionObj} conn
 * @param {MessageNode[]} nodes
 * @returns {Promise<ConnectionObj>}
 */
async function socketWriteIfOpen (conn, nodes) {
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
module.exports.socketWriteIfOpen = socketWriteIfOpen

/**
 *
 * @param {ConnectionObj} con
 * @param {MessageNode} node
 * @returns {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
 */
async function GetStockCarInfo (con, node) {
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

  const rPacket = new MessageNode('SENT')

  rPacket.deserialize(node.serialize())

  rPacket.updateBuffer(pReply.serialize())

  rPacket.dumpPacket()

  return { con, nodes: [rPacket] }
}
module.exports.GetStockCarInfo = GetStockCarInfo

/**
 *
 * @param {ConnectionObj} con
 * @param {MessageNode} node
 * @returns {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
 */
async function ClientConnect (con, node) {
  /**
   * Let's turn it into a ClientConnectMsg
   */
  // Not currently using this
  const newMsg = new ClientConnectMsg(node.data)

  debug('mcoserver:TCPManager')(`[TCPManager] Looking up the session key for ${newMsg.customerId}...`)
  const res = await databaseManager.fetchSessionKeyByCustomerId(
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
  const rPacket = new MessageNode('SENT')
  rPacket.deserialize(node.serialize())
  rPacket.updateBuffer(pReply.serialize())
  rPacket.dumpPacket()

  return { con, nodes: [rPacket] }
}

/**
 * Route or process MCOTS commands
 * @param {MessageNode} node
 * @param {ConnectionObj} conn
 * @returns {Promise<ConnectionObj>}
 */
async function ProcessInput (node, conn) {
  const currentMsgNo = node.msgNo
  const currentMsgString = mcotServer._MSG_STRING(currentMsgNo)

  switch (currentMsgString) {
    case 'MC_SET_OPTIONS':
      try {
        const result = await mcotServer._setOptions(conn, node)
        const responsePackets = result.nodes
        const updatedConnection = await module.exports.socketWriteIfOpen(
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
        const updatedConnection = await module.exports.socketWriteIfOpen(
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
        const updatedConnection = await module.exports.socketWriteIfOpen(
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
 * @param {MessageNode} msg
 * @param {ConnectionObj} con
 * @returns {Promise<ConnectionObj>}
 */
async function MessageReceived (msg, con) {
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
 * @param {IRawPacket} rawPacket
 * @return {Promise<ConnectionObj>}
 */
async function defaultHandler (rawPacket) {
  const { connection, remoteAddress, localPort, data } = rawPacket
  const messageNode = new MessageNode('RECEIVED')
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
module.exports.defaultHandler = defaultHandler

