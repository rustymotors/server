// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { logger } from 'mcos-shared/logger'
import {
  ClientConnectMessage,
  GenericReplyMessage,
  GenericRequestMessage,
  MessageNode,
  StockCar,
  StockCarInfoMessage
} from 'mcos-shared/types'
import { DatabaseManager } from 'mcos-database'
import { errorMessage } from 'mcos-shared'

const log = logger.child({ service: 'mcoserver:MCOTSServer' })

/**
 * Manages the game database server
 * @classdesc
 */
export class MCOTServer {
  /**
   *
   *
   * @private
   * @static
   * @type {MCOTServer}
   * @memberof MCOTServer
   */
  static _instance

  /**
   * Get the instance of the transactions server
   * @returns {MCOTServer}
   */
  static getTransactionServer () {
    if (!MCOTServer._instance) {
      MCOTServer._instance = new MCOTServer()
    }
    return MCOTServer._instance
  }

  /**
   * Creates an instance of MCOTServer.
   *
   * Please use {@link MCOTServer.getTransactionServer()} instead
   * @internal
   * @memberof MCOTServer
   */
  constructor () {
    /** @type {DatabaseManager} */  
    this.databaseManager = DatabaseManager.getInstance()
  }

  /**
   * Return the string representation of the numeric opcode
   *
   * @param {number} messageID
   * @return {string}
   */
  _MSG_STRING (messageID) {
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
   * @private
   * @param {import('mcos-core').TCPConnection} connection
   * @param {MessageNode} node
   * @return {import("mcos-shared/types").ConnectionWithPackets}>}
   */
  _login (connection, node) {
    // Create new response packet
    const pReply = new GenericReplyMessage()
    pReply.msgNo = 213
    pReply.msgReply = 105
    pReply.appId = connection.appId
    const rPacket = new MessageNode('sent')

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { connection, packetList: [rPacket] }
  }

  /**
   *
   * @private
   * @param {import('mcos-core').TCPConnection} connection
   * @param {MessageNode} node
   * @return {import("mcos-shared/types").ConnectionWithPackets}
   */
  _getLobbies (connection, node) {
    log.debug('In _getLobbies...')
    const lobbiesListMessage = node

    // Update the appId
    lobbiesListMessage.appId = connection.appId

    // Dump the packet
    log.debug('Dumping request...')
    log.debug(JSON.stringify(lobbiesListMessage))

    // Create new response packet
    // const lobbyMsg = new LobbyMsg()

    const pReply = new GenericReplyMessage()
    pReply.msgNo = 325
    pReply.msgReply = 324
    const rPacket = new MessageNode('sent')
    rPacket.flags = 9
    rPacket.setSeq(node.seq)

    const lobby = Buffer.alloc(12)
    lobby.writeInt32LE(325, 0)
    lobby.writeInt32LE(0, 4)
    lobby.writeInt32LE(0, 8)

    rPacket.updateBuffer(pReply.serialize())

    // // Dump the packet
    log.debug('Dumping response...')
    log.debug(JSON.stringify(rPacket))

    return { connection, packetList: [rPacket] }
  }

  /**
   *
   * @private
   * @param {import('mcos-core').TCPConnection} connection
   * @param {MessageNode} node
   * @return {import("mcos-shared/types").ConnectionWithPackets}
   */
  _logout (connection, node) {
    const logoutMessage = node

    logoutMessage.data = node.serialize()

    // Update the appId
    logoutMessage.appId = connection.appId

    // Create new response packet
    const pReply = new GenericReplyMessage()
    pReply.msgNo = 101
    pReply.msgReply = 106
    const rPacket = new MessageNode('sent')

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    /** @type {MessageNode[]} */
    const nodes = []

    return { connection, packetList: nodes }
  }

  /**
   *
   * @private
   * @param {import('mcos-core').TCPConnection} connection
   * @param {MessageNode} node
   * @return {import("mcos-shared/types").ConnectionWithPackets}
   */
  _setOptions (connection, node) {
    const setOptionsMessage = node

    setOptionsMessage.data = node.serialize()

    // Update the appId
    setOptionsMessage.appId = connection.appId

    // Create new response packet
    const pReply = new GenericReplyMessage()
    pReply.msgNo = 101
    pReply.msgReply = 109
    const rPacket = new MessageNode('sent')

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { connection, packetList: [rPacket] }
  }

  /**
   *
   * @private
   * @param {import('mcos-core').TCPConnection} connection
   * @param {MessageNode} node
   * @return {import("mcos-shared/types").ConnectionWithPackets}
   */
  _trackingMessage (connection, node) {
    const trackingMessage = node

    trackingMessage.data = node.serialize()

    // Update the appId
    trackingMessage.appId = connection.appId

    // Create new response packet
    const pReply = new GenericReplyMessage()
    pReply.msgNo = 101
    pReply.msgReply = 440
    const rPacket = new MessageNode('sent')

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { connection, packetList: [rPacket] }
  }

  /**
   *
   * @private
   * @param {import('mcos-core').TCPConnection} connection
   * @param {MessageNode} node
   * @return {import("mcos-shared/types").ConnectionWithPackets}
   */
  _updatePlayerPhysical (connection, node) {
    const updatePlayerPhysicalMessage = node

    updatePlayerPhysicalMessage.data = node.serialize()

    // Update the appId
    updatePlayerPhysicalMessage.appId = connection.appId

    // Create new response packet
    const pReply = new GenericReplyMessage()
    pReply.msgNo = 101
    pReply.msgReply = 266
    const rPacket = new MessageNode('sent')

    rPacket.deserialize(node.serialize())
    rPacket.updateBuffer(pReply.serialize())
    rPacket.dumpPacket()

    return { connection, packetList: [rPacket] }
  }

  /**
   * Handles the getStockCarInfo message
   * @param {import('mcos-core').TCPConnection} connection
   * @param {MessageNode} packet
   * @returns {import("mcos-shared/types").ConnectionWithPackets}
   */
  getStockCarInfo (connection, packet) {
    const getStockCarInfoMessage = new GenericRequestMessage()
    getStockCarInfoMessage.deserialize(packet.data)
    getStockCarInfoMessage.dumpPacket()

    const stockCarInfoMessage = new StockCarInfoMessage(200, 0, 105)
    stockCarInfoMessage.starterCash = 200
    stockCarInfoMessage.dealerId = 8
    stockCarInfoMessage.brand = 105

    stockCarInfoMessage.addStockCar(new StockCar(113, 20, 0)) // Bel-air
    stockCarInfoMessage.addStockCar(new StockCar(104, 15, 1)) // Fairlane - Deal of the day
    stockCarInfoMessage.addStockCar(new StockCar(402, 20, 0)) // Century

    stockCarInfoMessage.dumpPacket()

    const responsePacket = new MessageNode('sent')

    responsePacket.deserialize(packet.serialize())

    responsePacket.updateBuffer(stockCarInfoMessage.serialize())

    responsePacket.dumpPacket()

    return { connection, packetList: [responsePacket] }
  }

  /**
   * @param {import('mcos-core').TCPConnection} connection
   * @param {MessageNode} packet
   * @return {Promise<import("mcos-shared/types").ConnectionWithPackets>}
   */
  async clientConnect (connection, packet) {
    /**
     * Let's turn it into a ClientConnectMsg
     */
    // Not currently using this
    const newMessage = new ClientConnectMessage(packet.data)

    log.debug(
      `[TCPManager] Looking up the session key for ${newMessage.customerId}...`
    )
    const result = await this.databaseManager.fetchSessionKeyByCustomerId(
      newMessage.customerId
    )
    log.debug('[TCPManager] Session Key located!')

    const connectionWithKey = connection

    const { customerId, personaId, personaName } = newMessage
    const { sessionkey } = result

    const stringKey = Buffer.from(sessionkey, 'hex')
    connectionWithKey.setEncryptionKey(Buffer.from(stringKey.slice(0, 16)))

    // Update the connection's appId
    connectionWithKey.appId = newMessage.getAppId()

    log.debug(`cust: ${customerId} ID: ${personaId} Name: ${personaName}`)

    // Create new response packet
    const genericReplyMessage = new GenericReplyMessage()
    genericReplyMessage.msgNo = 101
    genericReplyMessage.msgReply = 438
    const responsePacket = new MessageNode('sent')
    responsePacket.deserialize(packet.serialize())
    responsePacket.updateBuffer(genericReplyMessage.serialize())
    responsePacket.dumpPacket()

    return { connection, packetList: [responsePacket] }
  }

  /**
   * Route or process MCOTS commands
   * @param {MessageNode} node
   * @param {import('mcos-core').TCPConnection} conn
   * @return {Promise<{err: Error | null, data: import('mcos-core').TCPConnection | null}>}
   */
  async processInput (node, conn) {
    const currentMessageNo = node.msgNo
    const currentMessageString = this._MSG_STRING(currentMessageNo)

    log.debug(
      `We are attempting to process a message with id ${currentMessageNo}(${currentMessageString})`
    )

    const messageHandlers = [
      {
        name: 'MC_SET_OPTIONS',
        handler: this.handleSetOptions.bind(this),
        errorMessage: 'Error in MC_SET_OPTIONS'
      },
      {
        name: 'MC_TRACKING_MSG',
        handler: this.handleTrackingMessage.bind(this),
        errorMessage: 'Error in MC_TRACKING_MSG'
      },
      {
        name: 'MC_UPDATE_PLAYER_PHYSICAL',
        handler: this.handleUpdatePlayerPhysical.bind(this),
        errorMessage: 'Error in MC_UPDATE_PLAYER_PHYSICAL'
      },
      {
        name: 'MC_CLIENT_CONNECT_MSG',
        handler: this.handleClientConnect.bind(this),
        errorMessage: '[TCPManager] Error writing to socket'
      },
      {
        name: 'MC_LOGIN',
        handler: this.handleLoginMessage.bind(this),
        errorMessage: '[TCPManager] Error writing to socket'
      },
      {
        name: 'MC_LOGOUT',
        handler: this.handleLogoutMessage.bind(this),
        errorMessage: '[TCPManager] Error writing to socket'
      },
      {
        name: 'MC_GET_LOBBIES',
        handler: this.handleGetLobbiesMessage.bind(this),
        errorMessage: '[TCPManager] Error writing to socket'
      },
      {
        name: 'MC_STOCK_CAR_INFO',
        handler: this.handleShockCarInfoMessage.bind(this),
        errorMessage: '[TCPManager] Error writing to socket'
      }
    ]

    const result = messageHandlers.find(
      (msg) => msg.name === currentMessageString
    )

    if (typeof result !== 'undefined') {
      try {
        const connection = await result.handler(conn, node)
        return { err: null, data: connection }
      } catch (error) {
        return {
          err: new Error(`${result.errorMessage}: ${String(error)}`),
          data: null
        }
      }
    }

    node.setAppId(conn.appId)
    return {
      err: new Error(
        `Message Number Not Handled: ${currentMessageNo} (${currentMessageString})
      conID: ${node.toFrom}  PersonaID: ${node.appId}`
      ),
      data: null
    }
  }

  /**
   *
   *
   * @param {import('mcos-core').TCPConnection} conn
   * @param {MessageNode} node
   * @return {import('mcos-core').TCPConnection}
   * @memberof MCOTServer
   */
  handleShockCarInfoMessage (conn, node) {
    const result = this.getStockCarInfo(conn, node)
    const responsePackets = result.packetList
    // Write the socket
    return result.connection.tryWritePackets(responsePackets)
  }

  /**
   *
   *
   * @param {import('mcos-core').TCPConnection} conn
   * @param {MessageNode} node
   * @return {import('mcos-core').TCPConnection}
   * @memberof MCOTServer
   */
  handleGetLobbiesMessage (conn, node) {
    const result = this._getLobbies(conn, node)
    log.debug('Dumping Lobbies response packet...')
    log.debug(result.packetList.join().toString())
    const responsePackets = result.packetList
    // Write the socket
    return result.connection.tryWritePackets(responsePackets)
  }

  /**
   *
   *
   * @param {import('mcos-core').TCPConnection} conn
   * @param {MessageNode} node
   * @return {import('mcos-core').TCPConnection}
   * @memberof MCOTServer
   */
  handleLogoutMessage (conn, node) {
    const result = this._logout(conn, node)
    const responsePackets = result.packetList
    // Write the socket
    return result.connection.tryWritePackets(responsePackets)
  }

  /**
   *
   *
   * @param {import('mcos-core').TCPConnection} conn
   * @param {MessageNode} node
   * @return {import('mcos-core').TCPConnection}
   * @memberof MCOTServer
   */
  handleLoginMessage (conn, node) {
    const result = this._login(conn, node)
    const responsePackets = result.packetList
    // Write the socket
    return result.connection.tryWritePackets(responsePackets)
  }

  /**
   *
   *
   * @param {import('mcos-core').TCPConnection} conn
   * @param {MessageNode} node
   * @return {Promise<import('mcos-core').TCPConnection>}
   * @memberof MCOTServer
   */
  async handleClientConnect (conn, node) {
    const result = await this.clientConnect(conn, node)
    const responsePackets = result.packetList
    // Write the socket
    return result.connection.tryWritePackets(responsePackets)
  }

  /**
   *
   *
   * @param {import('mcos-core').TCPConnection} conn
   * @param {MessageNode} node
   * @return {import('mcos-core').TCPConnection}
   * @memberof MCOTServer
   */
  handleUpdatePlayerPhysical (conn, node) {
    const result = this._updatePlayerPhysical(conn, node)
    const responsePackets = result.packetList
    return result.connection.tryWritePackets(responsePackets)
  }

  /**
   *
   *
   * @param {import('mcos-core').TCPConnection} conn
   * @param {MessageNode} node
   * @return {import('mcos-core').TCPConnection}
   * @memberof MCOTServer
   */
  handleTrackingMessage (conn, node) {
    const result = this._trackingMessage(conn, node)
    const responsePackets = result.packetList
    return result.connection.tryWritePackets(responsePackets)
  }

  /**
   *
   *
   * @param {import('mcos-core').TCPConnection} conn
   * @param {MessageNode} node
   * @return {import('mcos-core').TCPConnection}
   * @memberof MCOTServer
   */
  handleSetOptions (conn, node) {
    const result = this._setOptions(conn, node)
    const responsePackets = result.packetList
    return result.connection.tryWritePackets(responsePackets)
  }

  /**
   *
   *
   * @param {import('mcos-shared/types').MessageNode} message
   * @param {import('mcos-core').TCPConnection} newConnection
   * @return {*}
   * @memberof MCOTServer
   */
  isEncryptedFlagSet (message, newConnection) {
    return message.flags !== 80 && newConnection.useEncryption
  }

  /**
   *
   *
   * @param {import('mcos-shared/types').MessageNode} message
   * @param {import('mcos-core').TCPConnection} newConnection
   * @memberof MCOTServer
   */
  decryptBuffer (message, newConnection) {
    const encryptedBuffer = Buffer.from(message.data)
    log.debug(
      `Full packet before decrypting: ${encryptedBuffer.toString('hex')}`
    )

    log.debug(
      `Message buffer before decrypting: ${encryptedBuffer.toString('hex')}`
    )

    log.debug(`Using encryption id: ${newConnection.getEncryptionId()}`)
    const deciphered = newConnection.decryptBuffer(encryptedBuffer)
    log.debug(`Message buffer after decrypting: ${deciphered.toString('hex')}`)

    if (deciphered.readUInt16LE(0) <= 0) {
      return {
        err: new Error('Failure deciphering message, exiting.'),
        data: null
      }
    }
    return { err: null, data: deciphered }
  }

  /**
   * @param {MessageNode} message
   * @param {import('mcos-core').TCPConnection} con
   * @return {Promise<{err: Error | null, data: null | import('mcos-core').TCPConnection}>}
   */
  async messageReceived (message, con) {
    const newConnection = con
    if (!newConnection.useEncryption && message.flags && 0x08) {
      log.debug('Turning on encryption')
      newConnection.useEncryption = true
    }

    // If not a Heartbeat
    if (this.isEncryptedFlagSet(message, newConnection)) {
      if (!newConnection.isSetupComplete) {
        return {
          err: new Error(
            `Decrypt() not yet setup! Disconnecting...conId: ${con.id}`
          ),
          data: null
        }
      }

      if (message.flags - 8 >= 0) {
        const deciphered = this.tryDecryptBuffer(message, newConnection)
        if (deciphered.err || deciphered.data === null) {
          return { err: deciphered.err, data: null }
        }
        // Update the MessageNode with the deciphered buffer
        message.updateBuffer(deciphered.data)
      }
    }

    log.debug('Calling processInput()')
    return this.processInput(message, newConnection)
  }

  /**
   *
   *
   * @param {import('mcos-shared/types').MessageNode} message
   * @param {import('mcos-core').TCPConnection} newConnection
   * @return {{err: Error | null, data: Buffer | null}}
   * @memberof MCOTServer
   */
  tryDecryptBuffer (message, newConnection) {
    try {
      return {
        err: null,
        data: this.decryptBuffer(message, newConnection).data
      }
    } catch (error) {
      return {
        err: new Error(
          `Decrypt() exception thrown! Disconnecting...conId:${
            newConnection.id
          }: ${errorMessage(error)}`
        ),
        data: null
      }
    }
  }

  /**
   * Entry point for packets into the transactions server
   * @param {import("mcos-shared/types").UnprocessedPacket} rawPacket
   * @returns {Promise<{err: Error | null, data: import('mcos-core').TCPConnection | null}>}
   */
  async defaultHandler (rawPacket) {
    const { connection, data } = rawPacket
    const { remoteAddress, localPort } = connection
    const messageNode = new MessageNode('recieved')
    messageNode.deserialize(data)

    log.debug(
      `Received TCP packet',
    ${JSON.stringify({
      localPort,
      remoteAddress,
      direction: messageNode.direction,
      data: rawPacket.data.toString('hex')
    })}`
    )
    messageNode.dumpPacket()

    const processedPacket = this.messageReceived(messageNode, connection)

    if ((await processedPacket).err || (await processedPacket).data === null) {
      return { err: (await processedPacket).err, data: null }
    }

    return { err: null, data: (await processedPacket).data }
  }
}

export const getTransactionServer = MCOTServer.getTransactionServer
