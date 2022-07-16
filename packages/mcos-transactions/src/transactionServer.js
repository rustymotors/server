// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { logger } from 'mcos-shared/logger'
import {
  GenericReplyMessage,
  GenericRequestMessage,
  MessageNode,
  StockCar,
  StockCarInfoMessage
  , TClientConnectMessage
} from 'mcos-shared/types'
import { DatabaseManager } from 'mcos-database'
import { errorMessage, toHex } from 'mcos-shared'

const log = logger.child({ service: 'mcoserver:MCOTSServer' })

/**
   *
   *
   * @param {import('mcos-shared/types').MessageNode} message
   * @param {import('mcos-shared').TCPConnection} newConnection
   * @return {{err: Error | null, data: Buffer | null}}
   */
function tryDecryptBuffer (message, newConnection) {
  try {
    return {
      err: null,
      data: decryptBuffer(message, newConnection).data
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
   *
   *
   * @param {import('mcos-shared/types').MessageNode} message
   * @param {import('mcos-shared').TCPConnection} newConnection
   */
function decryptBuffer (message, newConnection) {
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
   *
   *
   * @param {import('mcos-shared').TCPConnection} conn
   * @param {MessageNode} node
   * @return {import('mcos-shared').TCPConnection}
   */
function handleUpdatePlayerPhysical (conn, node) {
  const result = updatePlayerPhysical(conn, node)
  const responsePackets = result.packetList
  return result.connection.tryWritePackets(responsePackets)
}

/**
     *
     *
     * @param {import('mcos-shared').TCPConnection} conn
     * @param {MessageNode} node
     * @return {import('mcos-shared').TCPConnection}
     */
function handleTrackingMessage (conn, node) {
  const result = trackingMessage(conn, node)
  const responsePackets = result.packetList
  return result.connection.tryWritePackets(responsePackets)
}

/**
     *
     *
     * @param {import('mcos-shared').TCPConnection} conn
     * @param {MessageNode} node
     * @return {import('mcos-shared').TCPConnection}
     */
function handleSetOptions (conn, node) {
  const result = setOptions(conn, node)
  const responsePackets = result.packetList
  return result.connection.tryWritePackets(responsePackets)
}

/**
     *
     *
     * @param {import('mcos-shared/types').MessageNode} message
     * @param {import('mcos-shared').TCPConnection} newConnection
     * @return {boolean}
     */
function isEncryptedFlagSet (message, newConnection) {
  return message.flags !== 80 && newConnection.useEncryption
}

/**
   *
   *
   * @param {import('mcos-shared').TCPConnection} conn
   * @param {MessageNode} node
   * @return {import('mcos-shared').TCPConnection}
   */
function handleShockCarInfoMessage (conn, node) {
  const result = getStockCarInfo(conn, node)
  const responsePackets = result.packetList
  // Write the socket
  return result.connection.tryWritePackets(responsePackets)
}

/**
   *
   *
   * @param {import('mcos-shared').TCPConnection} conn
   * @param {MessageNode} node
   * @return {import('mcos-shared').TCPConnection}
   */
function handleGetLobbiesMessage (conn, node) {
  const result = getLobbies(conn, node)
  log.debug('Dumping Lobbies response packet...')
  log.debug(result.packetList.join().toString())
  const responsePackets = result.packetList
  // Write the socket
  return result.connection.tryWritePackets(responsePackets)
}

/**
   *
   *
   * @param {import('mcos-shared').TCPConnection} conn
   * @param {MessageNode} node
   * @return {import('mcos-shared').TCPConnection}
   */
function handleLogoutMessage (conn, node) {
  const result = logout(conn, node)
  const responsePackets = result.packetList
  // Write the socket
  return result.connection.tryWritePackets(responsePackets)
}

/**
   *
   *
   * @param {import('mcos-shared').TCPConnection} conn
   * @param {MessageNode} node
   * @return {import('mcos-shared').TCPConnection}
   */
function handleLoginMessage (conn, node) {
  const result = login(conn, node)
  const responsePackets = result.packetList
  // Write the socket
  return result.connection.tryWritePackets(responsePackets)
}

/**
     * Return the string representation of the numeric opcode
     *
     * @param {number} messageID
     * @return {string}
     */
function MSG_STRING (messageID) {
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
     * @param {import('mcos-shared').TCPConnection} connection
     * @param {MessageNode} node
     * @return {{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}}>}
     */
function login (connection, node) {
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
     * @param {import('mcos-shared').TCPConnection} connection
     * @param {MessageNode} node
     * @return {{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}}
     */
function getLobbies (connection, node) {
  log.debug('In _getLobbies...')
  const lobbiesListMessage = node

  // Update the appId
  lobbiesListMessage.appId = connection.appId

  // Dump the packet
  log.debug('Dumping request...')
  log.debug(JSON.stringify(lobbiesListMessage))

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

  // Dump the packet
  log.debug('Dumping response...')
  log.debug(JSON.stringify(rPacket))

  return { connection, packetList: [rPacket] }
}

/**
     *
     * @private
     * @param {import('mcos-shared').TCPConnection} connection
     * @param {MessageNode} node
     * @return {{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}}
     */
function logout (connection, node) {
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
     * @param {import('mcos-shared').TCPConnection} connection
     * @param {MessageNode} node
     * @return {{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}}
     */
function setOptions (connection, node) {
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
     * @param {import('mcos-shared').TCPConnection} connection
     * @param {MessageNode} node
     * @return {{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}}
     */
function trackingMessage (connection, node) {
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
     * @param {import('mcos-shared').TCPConnection} connection
     * @param {MessageNode} node
     * @return {{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}}
     */
function updatePlayerPhysical (connection, node) {
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
     * @param {import('mcos-shared').TCPConnection} connection
     * @param {MessageNode} packet
     * @returns {{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}}
     */
function getStockCarInfo (connection, packet) {
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
     * @memberof MCOTServer
     */
  constructor () {
    /** @type {DatabaseManager} */
    this.databaseManager = DatabaseManager.getInstance()
  }

  /**
   * @param {import('mcos-shared').TCPConnection} connection
   * @param {MessageNode} packet
   * @return {Promise<{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}>}
   */
  async clientConnect (connection, packet) {
    /**
     * Let's turn it into a ClientConnectMsg
     */
    // Not currently using this
    const newMessage = new TClientConnectMessage()

    log.trace('NOT HERE@!')

    newMessage.deserialize(packet.rawPacket)

    const customerId = newMessage.getValue('customerId')
    if (typeof customerId !== 'number') {
      throw new TypeError(`customerId is wrong type. Expected 'number', got ${typeof customerId}`)
    }

    log.debug(
      `[TCPManager] Looking up the session key for ${customerId}...`
    )
    const result = await this.databaseManager.fetchSessionKeyByCustomerId(
      customerId
    )
    log.debug('[TCPManager] Session Key located!')

    const connectionWithKey = connection

    const { sessionkey } = result

    const stringKey = Buffer.from(sessionkey, 'hex')
    connectionWithKey.setEncryptionKey(Buffer.from(stringKey.slice(0, 16)))

    // Update the connection's appId
    connectionWithKey.appId = newMessage.getAppId()

    const personaId = newMessage.getValue('personaId')
    if (typeof personaId !== 'number') {
      throw new TypeError(`personaId is wrong type. Expected 'number', got ${typeof customerId}`)
    }

    const personaName = newMessage.getValue('personaName')
    if (typeof personaName !== 'string') {
      throw new TypeError(`personaName is wrong type. Expected 'string', got ${typeof customerId}`)
    }

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
   * @param {import('mcos-shared').TCPConnection} conn
   * @return {Promise<{err: Error | null, data: import('mcos-shared').TCPConnection | null}>}
   */
  async processInput (node, conn) {
    const currentMessageNo = node.msgNo
    const currentMessageString = MSG_STRING(currentMessageNo)

    log.debug(
      `We are attempting to process a message with id ${currentMessageNo}(${currentMessageString})`
    )

    const messageHandlers = [
      {
        name: 'MC_SET_OPTIONS',
        handler: handleSetOptions.bind(this),
        errorMessage: 'Error in MC_SET_OPTIONS'
      },
      {
        name: 'MC_TRACKING_MSG',
        handler: handleTrackingMessage.bind(this),
        errorMessage: 'Error in MC_TRACKING_MSG'
      },
      {
        name: 'MC_UPDATE_PLAYER_PHYSICAL',
        handler: handleUpdatePlayerPhysical.bind(this),
        errorMessage: 'Error in MC_UPDATE_PLAYER_PHYSICAL'
      },
      {
        name: 'MC_CLIENT_CONNECT_MSG',
        handler: this.handleClientConnect.bind(this),
        errorMessage: 'Error with K_MC_CLIENT_CONNECT_MSG'
      },
      {
        name: 'MC_LOGIN',
        handler: handleLoginMessage.bind(this),
        errorMessage: 'Error with MC_LOGIN'
      },
      {
        name: 'MC_LOGOUT',
        handler: handleLogoutMessage.bind(this),
        errorMessage: 'Error with MC_LOGOUT'
      },
      {
        name: 'MC_GET_LOBBIES',
        handler: handleGetLobbiesMessage.bind(this),
        errorMessage: 'Error with MC_GET_LOBBIES'
      },
      {
        name: 'MC_STOCK_CAR_INFO',
        handler: handleShockCarInfoMessage.bind(this),
        errorMessage: 'Error with MC_STOCK_CAR_INFO'
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
          err: new Error(`${result.errorMessage}: ${errorMessage(error)}`),
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
   * @param {import('mcos-shared').TCPConnection} conn
   * @param {MessageNode} node
   * @return {Promise<import('mcos-shared').TCPConnection>}
   * @memberof MCOTServer
   */
  async handleClientConnect (conn, node) {
    log.trace(`Raw bytes in handleClientConnect: ${toHex(node.rawPacket)}`)

    const result = await this.clientConnect(conn, node)
    const responsePackets = result.packetList
    // Write the socket
    return result.connection.tryWritePackets(responsePackets)
  }

  /**
   * @param {MessageNode} message
   * @param {import('mcos-shared').TCPConnection} con
   * @return {Promise<{err: Error | null, data: null | import('mcos-shared').TCPConnection}>}
   */
  async messageReceived (message, con) {
    const newConnection = con
    if (!newConnection.useEncryption && message.flags && 0x08) {
      log.debug('Turning on encryption')
      newConnection.useEncryption = true
    }

    // If not a Heartbeat
    if (isEncryptedFlagSet(message, newConnection)) {
      if (!newConnection.isSetupComplete) {
        return {
          err: new Error(
            `Decrypt() not yet setup! Disconnecting...conId: ${con.id}`
          ),
          data: null
        }
      }

      if (message.flags - 8 >= 0) {
        const deciphered = tryDecryptBuffer(message, newConnection)
        if (deciphered.err || deciphered.data === null) {
          return { err: deciphered.err, data: null }
        }
        // Update the MessageNode with the deciphered buffer
        message.updateBuffer(deciphered.data)
      }
    }

    log.debug('Calling processInput()')
    try {
      return await this.processInput(message, newConnection)
    } catch (error) {
      const errMessage = String(error).toString()
      return {
        err: new Error(
          `There was an error calling processInput: ${errMessage}`
        ),
        data: null
      }
    }
  }

  /**
   * Entry point for packets into the transactions server
   * @param {{connection: import('mcos-shared').TCPConnection, data: Buffer}} rawPacket
   * @returns {Promise<{err: Error | null, data: import('mcos-shared').TCPConnection | null}>}
   */
  async defaultHandler (rawPacket) {
    const { connection, data } = rawPacket
    const { remoteAddress, localPort } = connection
    const messageNode = new MessageNode('recieved')
    messageNode.deserialize(data)

    log.debug(
      `[default]Received TCP packet',
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
