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

import { EncryptionManager, isMCOT, TCPConnection, NPSPacketManager } from 'mcos-core'
import { errorMessage } from 'mcos-shared'
import { logger } from 'mcos-shared/logger'
import { MessageNode, NPS_COMMANDS } from 'mcos-shared/types'
import { MCOTServer } from 'mcos-transactions'
import { randomUUID } from 'node:crypto'

const log = logger.child({ service: 'mcos:gateway:connections' })

/** @type {import("mcos-shared/types").SocketWithConnectionInfo[]} */
const connectionList = []

/**
 *
 *
 * @export
 * @return {import('mcos-shared/types').SocketWithConnectionInfo[]}
 */
export function getAllConnections () {
  return connectionList
}

/**
   * Return an existing connection, or a new one
   *
   * @param {import("node:net").Socket} socket
   * @return {import('mcos-shared/types').SocketWithConnectionInfo}
   */
export function selectConnection (socket) {
  const existingConnection = connectionList.find(c => {
    return c.socket.remoteAddress === socket.remoteAddress && c.socket.localPort === socket.localPort
  })

  if (typeof existingConnection !== 'undefined') {
    log.info(
        `I have seen connections from ${socket.remoteAddress} on ${socket.localPort} before`
    )
    existingConnection.socket = socket
    log.debug('Returning found connection after attaching socket')
    return existingConnection
  }

  const newConnectionId = randomUUID()
  log.debug(`Creating new connection with id ${newConnectionId}`)
  /** @type {import("mcos-shared/types").SocketWithConnectionInfo} */
  const newConnection = {
    seq: 0,
    id: newConnectionId,
    socket,
    personaId: 0,
    lastMsgTimestamp: 0,
    inQueue: true,
    useEncryption: false
  }

  log.info(
      `I have not seen connections from ${socket.remoteAddress} on ${socket.localPort} before, adding it.`
  )

  connectionList.push(newConnection)

  log.debug(
      `Connection with id of ${newConnection.id} has been added. The connection list now contains ${connectionList.length} connections.`
  )
  return newConnection
}

/**
   * Update the internal connection record
   *
   * @param {string} connectionId
   * @param {import("mcos-shared/types").SocketWithConnectionInfo} updatedConnection
   */
export function updateConnection (connectionId, updatedConnection) {
  try {
    const index = connectionList.findIndex(
      c => {
        return c.id === connectionId
      }
    )
    connectionList.splice(index, 1)
    connectionList.push(updatedConnection)
  } catch (error) {
    throw new Error(
          `Error updating connection, ${errorMessage(error)}`
    )
  }
}

/**
   * Update the internal connection record
   *
   * @param {string} address
   * @param {number} port
   * @param {import("mcos-core").TCPConnection} newConnection
   * @return {*}  {TCPConnection[]} the updated connection
   */
export function updateConnectionByAddressAndPort (address, port, newConnection) {
  if (newConnection === undefined) {
    throw new Error(
      `Undefined connection: ${JSON.stringify({
        remoteAddress: address,
        localPort: port
      })}`
    )
  }

  try {
    const index = connectionList.findIndex(
      (c) =>
        c.socket.remoteAddress === address && c.socket.localPort === port
    )
    connectionList.splice(index, 1)
    /** @type {import('mcos-shared/types').SocketWithConnectionInfo} */
    const newConnectionRecord = {
      socket: newConnection.sock,
      seq: 0,
      id: newConnection.id,
      personaId: newConnection.appId,
      lastMsgTimestamp: newConnection.lastMsg,
      inQueue: newConnection.inQueue,
      useEncryption: newConnection.useEncryption
    }
    connectionList.push(newConnectionRecord)
    return connectionList
  } catch (error) {
    process.exitCode = -1
    throw new Error(
      `Error updating connection, ${JSON.stringify({
        error,
        connections: connectionList
      })}`
    )
  }
}

/**
   * Locate connection by remoteAddress and localPort in the connections array
   * @param {string} remoteAddress
   * @param {number} localPort
   * @return {import("mcos-core").TCPConnection | null}
   */
function findConnectionByAddressAndPort (remoteAddress, localPort) {
  const record =
      connectionList.find((c) => {
        const match =
          remoteAddress === c.socket.remoteAddress &&
          localPort === c.socket.localPort
        return match
      }) || null
  if (!record) {
    return null
  }
  const newConnection = new TCPConnection(record.id, record.socket)
  return newConnection
}

/**
   * Creates a new connection object for the socket and adds to list
   * @param {string} connectionId
   * @param {import("node:net").Socket} socket
   * @returns {TCPConnection}
   */
function createNewConnection (connectionId, socket) {
  const newConnection = new TCPConnection(connectionId, socket)
  newConnection.setEncryptionManager(new EncryptionManager())
  return newConnection
}

/**
   * Add new connection to internal list
   *
   * @param {TCPConnection} connection
   * @return {import('mcos-shared/types').SocketWithConnectionInfo[]}
   */
function addConnection (connection) {
  /** @type {import('mcos-shared/types').SocketWithConnectionInfo} */
  const newConnection = {
    socket: connection.sock,
    seq: 0,
    id: connection.id,
    personaId: connection.appId,
    lastMsgTimestamp: connection.lastMsg,
    inQueue: connection.inQueue,
    useEncryption: connection.useEncryption
  }
  connectionList.push(newConnection)
  return connectionList
}

/**
   * Return an existing connection, or a new one
   *
   * @param {import("node:net").Socket} socket
   * @return {import("mcos-core").TCPConnection | null}
   */
export function findOrNewConnection (socket) {
  if (typeof socket.remoteAddress === 'undefined') {
    log.fatal('The socket is missing a remoteAddress, unable to use.')
    return null
  }

  if (typeof socket.localPort === 'undefined') {
    log.fatal('The socket is missing a localPost, unable to use.')
    return null
  }

  const existingConnection = findConnectionByAddressAndPort(
    socket.remoteAddress,
    socket.localPort
  )
  if (existingConnection) {
    log.info(
      `I have seen connections from ${socket.remoteAddress} on ${socket.localPort} before`
    )
    existingConnection.sock = socket
    log.debug('Returning found connection after attaching socket')
    return existingConnection
  }

  const newConnectionId = randomUUID()
  log.debug(`Creating new connection with id ${newConnectionId}`)
  const newConnection = createNewConnection(newConnectionId, socket)
  log.info(
    `I have not seen connections from ${socket.remoteAddress} on ${socket.localPort} before, adding it.`
  )
  const updatedConnectionList = addConnection(newConnection)
  log.debug(
    `Connection with id of ${newConnection.id} has been added. The connection list now contains ${updatedConnectionList.length} connections.`
  )
  return newConnection
}

/**
   * Get the name connected to the NPS opcode
   * @param {number} opCode
   * @return {string}
   */
function getNameFromOpCode (opCode) {
  const opCodeName = NPS_COMMANDS.find((code) => code.value === opCode)
  if (opCodeName === undefined) {
    throw new Error(`Unable to locate name for opCode ${opCode}`)
  }

  return opCodeName.name
}

/**
   * Check incoming data and route it to the correct handler based on localPort
   *
   * @param {import("mcos-shared/types").UnprocessedPacket} rawPacket
   * @return {Promise<{err: Error | null, data: TCPConnection | null}>}
   */
export async function processData (rawPacket) {
  const npsPacketManager = new NPSPacketManager()

  const { data } = rawPacket
  const { remoteAddress, localPort } = rawPacket.connection

  // Log the packet as debug
  log.debug(
      `logging raw packet,
      ${JSON.stringify({
        remoteAddress,
        localPort,
        data: data.toString('hex')
      })}`
  )

  let packetType = 'tcp'

  if (isMCOT(rawPacket.data)) {
    packetType = 'tomc'
  }

  log.debug(
      `Identified packet type as ${packetType} on port ${rawPacket.connection.localPort}`
  )

  if (localPort === 8226) {
    log.debug('Packet has requested the login server')
  }
  if (localPort === 8228) {
    log.debug('Packet has requested the persona server')
  }
  if (localPort === 7003) {
    log.debug('Packet has requested the lobby server')
  }
  if (localPort === 43300) {
    log.debug('Packet has requested the transactions server')
  }

  switch (localPort) {
    case 8226:
    case 8228:
    case 7003: {
      try {
        const opCode = rawPacket.data.readInt16BE(0)
        const msgName = getNameFromOpCode(rawPacket.data.readInt16BE(0))
        log.debug(
            `Recieved NPS packet,
            ${JSON.stringify({
              opCode,
              msgName,
              localPort
            })}`
        )
      } catch (error) {
        log.error(errorMessage(error))
        return {
          err: new Error(
              `Error in the recieved packet: ${errorMessage(error)}`
          ),
          data: null
        }
      }
      try {
        return {
          err: null,
          data: await npsPacketManager.processNPSPacket(rawPacket)
        }
      } catch (error) {
        log.error(errorMessage(error))
        return {
          err: new Error(
              `There was an error processing the data: ${errorMessage(error)}`
          ),
          data: null
        }
      }
    }

    case 43_300: {
      log.debug('Recieved MCOTS packet')
      const newNode = new MessageNode('recieved')
      newNode.deserialize(rawPacket.data)
      log.debug(JSON.stringify(newNode))

      return MCOTServer.getTransactionServer().defaultHandler(rawPacket)
    }

    default:
      log.debug(JSON.stringify(rawPacket))

      throw new Error(
          `We received a packet on port ${localPort}. We don't what to do yet, going to throw so the message isn't lost.`
      )
  }
}
