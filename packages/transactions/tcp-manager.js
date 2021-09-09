/* eslint-disable @typescript-eslint/no-unused-vars */
// Mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Logger } from '@drazisil/mco-logger'
import { ClientConnectMessage } from 'transactions'
import { GenericReplyMessage } from 'core'
import { GenericRequestMessage } from 'core'
import { DatabaseManager } from 'database'
import { StockCar } from 'transactions'
import { StockCarInfoMessage } from 'transactions'
import { MCOTServer } from './index.js'
import { MessageNode } from './message-node.js'
import { Buffer } from 'buffer'

const { log } = Logger.getInstance()

/**
 * Manages TCP connection packet processing
 */

export class TCPManager {
  /**
   * @type {TCPManager}
   */
  static _instance

  /**
   *
   * @returns {TCPManager}
   */
  static getInstance() {
    if (!TCPManager._instance) {
      TCPManager._instance = new TCPManager(false)
    }
    return TCPManager._instance
  }

  constructor(isNew = true) {
    if (isNew) {
      throw new Error('Please use getInstance()')
    }

    this.mcotServer = MCOTServer.getInstance()
    this.databaseManager = DatabaseManager.getInstance()
  }

  /**
   *
   * @param {import('types').ITCPConnection} connection
   * @param {import('types').IMessageNode} packet
   * @return {Promise<import('types').ConnectionWithPacket>}
   */
  async compressIfNeeded(connection, packet) {
    // Check if compression is needed
    if (packet.getLength() < 80) {
      log('debug', 'Too small, should not compress', {
        service: 'mcoserver:MCOTSServer',
      })
    } else {
      log('debug', 'This packet should be compressed', {
        service: 'mcoserver:MCOTSServer',
      })
      /* TODO: Write compression.
       *
       * At this time we will still send the packet, to not hang connection
       * Client will crash though, due to memory access errors
       */
    }

    return { connection, packet }
  }

  /**
   *
   * @param {import('types').ITCPConnection} connection
   * @param {import('types').IMessageNode} packet
   * @returns {Promise<import('types').ConnectionWithPacket>}
   */
  async encryptIfNeeded(connection, packet) {
    // Check if encryption is needed
    if (packet.flags - 8 >= 0) {
      log('debug', 'encryption flag is set', {
        service: 'mcoserver:MCOTSServer',
      })

      if (connection.enc) {
        packet.updateBuffer(connection.enc.encrypt(packet.data))
      } else {
        throw new Error('encryption out on connection is null')
      }

      log('debug', `encrypted packet: ${packet.serialize().toString('hex')}`, {
        service: 'mcoserver:MCOTSServer',
      })
    }

    return { connection, packet }
  }

  /**
   *
   * @param {import('types').ITCPConnection} connection
   * @param {import('types').IMessageNode[]} packetList
   * @return {Promise<import('types').ITCPConnection>}
   */
  async socketWriteIfOpen(connection, packetList) {
    /** @type {import('types').ConnectionWithPackets} */
    const updatedConnection = {
      connection: connection,
      packetList: packetList,
    }
    // For each node in nodes
    for (const packet of updatedConnection.packetList) {
      // Does the packet need to be compressed?
      /** @type {MessageNode} */
      const compressedPacket = (await this.compressIfNeeded(connection, packet))
        .packet
      // Does the packet need to be encrypted?
      const encryptedPacket = (
        await this.encryptIfNeeded(connection, compressedPacket)
      ).packet
      // Log that we are trying to write
      log(
        'debug',
        ` Atempting to write seq: ${encryptedPacket.seq} to conn: ${updatedConnection.connection.id}`,
        { service: 'mcoserver:MCOTSServer' },
      )

      // Log the buffer we are writing
      log(
        'debug',
        `Writting buffer: ${encryptedPacket.serialize().toString('hex')}`,
        {
          service: 'mcoserver:MCOTSServer',
        },
      )
      if (connection.sock.writable) {
        // Write the packet to socket
        connection.sock.write(encryptedPacket.serialize())
      } else {
        throw new Error(
          `Error writing ${encryptedPacket.serialize()} to ${
            connection.sock.remoteAddress
          } , ${connection.sock.localPort.toString()}`,
        )
      }
    }

    return updatedConnection.connection
  }

  /**
   *
   * @param {import('types').ITCPConnection} connection
   * @param {import('types').IMessageNode} packet
   * @return {Promise<import('types').ConnectionWithPackets>}
   */
  async getStockCarInfo(connection, packet) {
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

    const responsePacket = new MessageNode('Sent')

    responsePacket.deserialize(packet.serialize())

    responsePacket.updateBuffer(stockCarInfoMessage.serialize())

    responsePacket.dumpPacket()

    return { connection, packetList: [responsePacket] }
  }

  /**
   *
   * @param {import('types').ITCPConnection} connection
   * @param {import('types').IMessageNode} packet
   * @return {Promise<import('types').ConnectionWithPackets>}
   */
  async clientConnect(connection, packet) {
    /**
     * Let's turn it into a ClientConnectMsg
     */
    // Not currently using this
    const newMessage = new ClientConnectMessage(packet.data)

    log(
      'debug',
      `[TCPManager] Looking up the session key for ${newMessage.customerId}...`,
      { service: 'mcoserver:MCOTSServer' },
    )
    const result = await this.databaseManager.fetchSessionKeyByCustomerId(
      newMessage.customerId,
    )
    log('debug', '[TCPManager] Session Key located!', {
      service: 'mcoserver:MCOTSServer',
    })

    const connectionWithKey = connection

    const { customerId, personaId, personaName } = newMessage
    const { sessionkey } = result

    const stringKey = Buffer.from(sessionkey, 'hex')
    connectionWithKey.setEncryptionKey(Buffer.from(stringKey.slice(0, 16)))

    // Update the connection's appId
    connectionWithKey.appId = newMessage.getAppId()

    log('debug', `cust: ${customerId} ID: ${personaId} Name: ${personaName}`, {
      service: 'mcoserver:MCOTSServer',
    })

    // Create new response packet
    const genericReplyMessage = new GenericReplyMessage()
    genericReplyMessage.msgNo = 101
    genericReplyMessage.msgReply = 438
    const responsePacket = new MessageNode('Sent')
    responsePacket.deserialize(packet.serialize())
    responsePacket.updateBuffer(genericReplyMessage.serialize())
    responsePacket.dumpPacket()

    return { connection, packetList: [responsePacket] }
  }

  /**
   * Route or process MCOTS commands
   * @param {import('types').IMessageNode} node
   * @param {import('types').ITCPConnection} conn
   * @return {Promise<import('types').ITCPConnection>}
   */
  async processInput(node, conn) {
    const currentMessageNo = node.msgNo
    const currentMessageString = this.mcotServer._MSG_STRING(currentMessageNo)

    switch (currentMessageString) {
      case 'MC_SET_OPTIONS':
        try {
          const result = await this.mcotServer._setOptions(conn, node)
          const responsePackets = result.packetList
          return await this.socketWriteIfOpen(
            result.connection,
            responsePackets,
          )
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(`Error in MC_SET_OPTIONS: ${error}`)
          }

          throw new Error('Error in MC_SET_OPTIONS, error unknown')
        }

      case 'MC_TRACKING_MSG':
        try {
          const result = await this.mcotServer._trackingMessage(conn, node)
          const responsePackets = result.packetList
          return this.socketWriteIfOpen(result.connection, responsePackets)
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(`Error in MC_TRACKING_MSG: ${error}`)
          }

          throw new Error('Error in MC_TRACKING_MSG, error unknown')
        }

      case 'MC_UPDATE_PLAYER_PHYSICAL':
        try {
          const result = await this.mcotServer._updatePlayerPhysical(conn, node)
          const responsePackets = result.packetList
          return this.socketWriteIfOpen(result.connection, responsePackets)
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(`Error in MC_UPDATE_PLAYER_PHYSICAL: ${error}`)
          }

          throw new Error('Error in MC_UPDATE_PLAYER_PHYSICAL, error unknown')
        }

      case 'MC_CLIENT_CONNECT_MSG': {
        try {
          const result = await this.clientConnect(conn, node)
          const responsePackets = result.packetList
          // Write the socket
          return await this.socketWriteIfOpen(
            result.connection,
            responsePackets,
          )
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(
              `[TCPManager] Error writing to socket: ${error}`,
            )
          }

          throw new Error('[TCPManager] Error writing to socket, error unknown')
        }
      }

      case 'MC_LOGIN': {
        try {
          const result = await this.mcotServer._login(conn, node)
          const responsePackets = result.packetList
          // Write the socket
          return this.socketWriteIfOpen(result.connection, responsePackets)
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(
              `[TCPManager] Error writing to socket: ${error}`,
            )
          }

          throw new Error('[TCPManager] Error writing to socket, error unknown')
        }
      }

      case 'MC_LOGOUT': {
        try {
          const result = await this.mcotServer._logout(conn, node)
          const responsePackets = result.packetList
          // Write the socket
          return await this.socketWriteIfOpen(
            result.connection,
            responsePackets,
          )
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(
              `[TCPManager] Error writing to socket: ${error}`,
            )
          }

          throw new Error('[TCPManager] Error writing to socket, error unknown')
        }
      }

      case 'MC_GET_LOBBIES': {
        const result = await this.mcotServer._getLobbies(conn, node)
        log('debug', 'Dumping Lobbies response packet...', {
          service: 'mcoserver:MCOTSServer',
        })
        log('debug', result.packetList.join(), {
          service: 'mcoserver:MCOTSServer',
        })
        const responsePackets = result.packetList
        try {
          // Write the socket
          return await this.socketWriteIfOpen(
            result.connection,
            responsePackets,
          )
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(
              `[TCPManager] Error writing to socket: ${error}`,
            )
          }

          throw new Error('[TCPManager] Error writing to socket, error unknown')
        }
      }

      case 'MC_STOCK_CAR_INFO': {
        try {
          const result = await this.getStockCarInfo(conn, node)
          const responsePackets = result.packetList
          // Write the socket
          return this.socketWriteIfOpen(result.connection, responsePackets)
        } catch (error) {
          if (error instanceof Error) {
            throw new TypeError(
              `[TCPManager] Error writing to socket: ${error}`,
            )
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
   * @param {import('types').ITCPConnection} con
   * @return {Promise<import('types').ITCPConnection>}
   * @param {import('types').IMessageNode} message
   */
  async messageReceived(message, con) {
    const newConnection = con
    if (!newConnection.useEncryption && message.flags && 0x08) {
      log('debug', 'Turning on encryption', {
        service: 'mcoserver:MCOTSServer',
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
            'debug',
            `Full packet before decrypting: ${encryptedBuffer.toString('hex')}`,
            { service: 'mcoserver:MCOTSServer' },
          )

          log(
            'debug',
            `Message buffer before decrypting: ${encryptedBuffer.toString(
              'hex',
            )}`,
            { service: 'mcoserver:MCOTSServer' },
          )
          if (!newConnection.enc) {
            throw new Error('ARC4 decrypter is null')
          }

          log('debug', `Using encryption id: ${newConnection.enc.getId()}`, {
            service: 'mcoserver:MCOTSServer',
          })
          const deciphered = newConnection.enc.decrypt(encryptedBuffer)
          log(
            'debug',
            `Message buffer after decrypting: ${deciphered.toString('hex')}`,
            {
              service: 'mcoserver:MCOTSServer',
            },
          )

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
    return this.processInput(message, newConnection)
  }

  /**
   *
   * @param {import('types').IRawPacket} rawPacket
   * @return {Promise<import('types').ITCPConnection>}
   */
  async defaultHandler(rawPacket) {
    const { connection, remoteAddress, localPort, data } = rawPacket
    const messageNode = new MessageNode('Recieved')
    messageNode.deserialize(data)

    log(
      'debug',
      `Received TCP packet',
      ${JSON.stringify({
        localPort,
        remoteAddress,
        direction: messageNode.direction,
        data: rawPacket.data.toString('hex'),
      })}`,
      { service: 'mcoserver:MCOTSServer' },
    )
    messageNode.dumpPacket()

    return this.messageReceived(messageNode, connection)
  }
}
