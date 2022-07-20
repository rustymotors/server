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

import { EncryptionManager, errorMessage, TCPConnection } from '../../mcos-shared/src/index.js'
import { logger } from '../../mcos-shared/src/logger/index.js'
import { MessageNode, NPS_COMMANDS, SocketWithConnectionInfo } from '../../mcos-shared/src/types/index.js'
import { getTransactionServer } from '../../mcos-transactions/src/index.js'
import { randomUUID } from 'node:crypto'
import type { Socket } from 'node:net'
import { NPSPacketManager } from './nps-packet-manager.js'

const log = logger.child({ service: 'mcos:gateway:connections' })

/** @type {import("mcos-shared/types").SocketWithConnectionInfo[]} */
const connectionList: SocketWithConnectionInfo[] = []

/**
 *
 *
 * @export
 * @return {import('mcos-shared/types').SocketWithConnectionInfo[]}
 */
export function getAllConnections (): SocketWithConnectionInfo[] {
  return connectionList
}

/**
   * Return an existing connection, or a new one
   *
   * @param {import("node:net").Socket} socket
   * @return {import('mcos-shared/types').SocketWithConnectionInfo}
   */
export function selectConnection (socket: Socket): SocketWithConnectionInfo {

  const { localPort, remoteAddress } = socket

  if (typeof localPort === 'undefined' || typeof remoteAddress === 'undefined') {
    const errMessage = `Either localPort or remoteAddress is missing on socket. Can not continue.`
    log.error(errMessage)
    throw new Error(errMessage)
  }

  const existingConnection = connectionList.find(c => {
    return c.socket.remoteAddress === remoteAddress && c.localPort === localPort
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
  const newConnection: SocketWithConnectionInfo = {
    seq: 0,
    id: newConnectionId,
    socket,
    remoteAddress: socket.remoteAddress || '',
    localPort: socket.localPort || 0,
    personaId: 0,
    lastMessageTimestamp: 0,
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
export function updateConnection (connectionId: string, updatedConnection: SocketWithConnectionInfo): void {
  log.trace(`Updating connection with id: ${connectionId}`)
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
   * @param {import("mcos-shared").TCPConnection} newConnection
   * @return {*}  {TCPConnection[]} the updated connection
   */
export function updateConnectionByAddressAndPort (address: string, port: number, newConnection: TCPConnection): SocketWithConnectionInfo[] {
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
    const newConnectionRecord: SocketWithConnectionInfo = {
      socket: newConnection.sock,
      remoteAddress: address,
      localPort: newConnection.sock.localPort || 0,
      seq: 0,
      id: newConnection.id,
      personaId: newConnection.appId,
      lastMessageTimestamp: newConnection.lastMsg,
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
   * @return {{ legacy: import("mcos-shared").TCPConnection, modern: import('mcos-shared/types').SocketWithConnectionInfo} | null}
   */
function findConnectionByAddressAndPort (remoteAddress: string, localPort: number): { legacy: TCPConnection; modern: SocketWithConnectionInfo } | null {
  const record =
      connectionList.find((c) => {
        const match =
        c.socket.remoteAddress === remoteAddress  &&
        c.localPort === localPort
        return match
      }) || null
  if (!record) {
    return null
  }
  const newConnection = new TCPConnection(record.id, record.socket)
  return { legacy: newConnection, modern: record }
}

/**
   * Creates a new connection object for the socket and adds to list
   * @param {string} connectionId
   * @param {import("node:net").Socket} socket
   * @returns {{ legacy: import("mcos-shared").TCPConnection, modern: import('mcos-shared/types').SocketWithConnectionInfo}}
   */
function createNewConnection (connectionId: string, socket: Socket): { legacy: TCPConnection; modern: SocketWithConnectionInfo } {
  const newConnection = new TCPConnection(connectionId, socket)

  const { localPort, remoteAddress } = socket

  if (typeof localPort === 'undefined' || typeof remoteAddress === 'undefined') {
    const errMessage = `Either localPort or remoteAddress is missing on socket. Can not continue.`
    log.error(errMessage)
    throw new Error(errMessage)
  }

  /** @type {import('mcos-shared/types').SocketWithConnectionInfo} */
  const newConnectionRecord: SocketWithConnectionInfo = {
    socket,
    remoteAddress,
    localPort,
    seq: 0,
    id: connectionId,
    personaId: 0,
    lastMessageTimestamp: 0,
    inQueue: true,
    useEncryption: false
  }
  newConnection.setEncryptionManager(new EncryptionManager())
  return { legacy: newConnection, modern: newConnectionRecord }
}

/**
   * Add new connection to internal list
   *
   * @param {import('mcos-shared/types').SocketWithConnectionInfo} connection
   * @return {import('mcos-shared/types').SocketWithConnectionInfo[]}
   */
function addConnection (connection: SocketWithConnectionInfo): SocketWithConnectionInfo[] {
  connectionList.push(connection)
  return connectionList
}

/**
   * Return an existing connection, or a new one
   *
   * @param {import("node:net").Socket} socket
   * @return {{ legacy: import("mcos-shared").TCPConnection, modern: import('mcos-shared/types').SocketWithConnectionInfo} | null}
   */
export function findOrNewConnection (socket: Socket): { legacy: TCPConnection; modern: SocketWithConnectionInfo } | null {
  const { localPort, remoteAddress } = socket

  if (typeof localPort === 'undefined' || typeof remoteAddress === 'undefined') {
    const errMessage = `Either localPort or remoteAddress is missing on socket. Can not continue.`
    log.error(errMessage)
    throw new Error(errMessage)
  }

  const existingConnection = findConnectionByAddressAndPort(
    remoteAddress,
    localPort
  )
  if (existingConnection) {
    log.info(
      `I have seen connections from ${socket.remoteAddress} on ${socket.localPort} before`
    )

    // Legacy
    existingConnection.legacy.sock = socket
    log.debug('[L] Returning found connection after attaching socket')

    // Modern
    existingConnection.modern.socket = socket
    log.debug('[M] Returning found connection after attaching socket')
    return existingConnection
  }

  const newConnectionId = randomUUID()
  log.debug(`Creating new connection with id ${newConnectionId}`)
  const newConnection = createNewConnection(newConnectionId, socket)
  log.info(
    `I have not seen connections from ${socket.remoteAddress} on ${socket.localPort} before, adding it.`
  )
  const updatedConnectionList = addConnection(newConnection.modern)
  log.debug(
    `Connection with id of ${newConnection.modern.id} has been added. The connection list now contains ${updatedConnectionList.length} connections.`
  )
  return newConnection
}

/**
   * Get the name connected to the NPS opcode
   * @param {number} opCode
   * @return {string}
   */
function getNameFromOpCode (opCode: number): string {
  const opCodeName = NPS_COMMANDS.find((code) => code.value === opCode)
  if (opCodeName === undefined) {
    throw new Error(`Unable to locate name for opCode ${opCode}`)
  }

  return opCodeName.name
}

/**
 * Is this an MCOT bound packet?
 *
 * @export
 * @param {Buffer} inputBuffer
 * @return {boolean}
 */
export function isMCOT (inputBuffer: Buffer): boolean {
  return inputBuffer.toString('utf8', 2, 6) === 'TOMC'
}

/**
   * Check incoming data and route it to the correct handler based on localPort
   *
   * @param {{connection: import('mcos-shared').TCPConnection, data: Buffer}} rawPacket
   * @return {Promise<{err: Error | null, data: TCPConnection | null}>}
   */
export async function processData (rawPacket: { connection: import('../../mcos-shared/src/index.js').TCPConnection; data: Buffer }): Promise<{ err: Error | null; data: TCPConnection | null }> {
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
      const dataLength = rawPacket.data.byteLength
      log.debug(`Recieved Raw packet of ${dataLength} bytes: ${rawPacket.data.toString('hex')}`)
      const newNode = new MessageNode('received')
      newNode.deserialize(rawPacket.data)
      log.debug(`Recieved MCOTS packet of ${newNode.dataLength} bytes: ${newNode.toString()}`)
      log.trace('[listen] In processData(pre-defaultHandler)')

      const response = await getTransactionServer().defaultHandler(rawPacket)
      log.trace('[listen] In processData(post-defaultHandler)')
      return response
    }

    default:
      log.debug(JSON.stringify(rawPacket))

      throw new Error(
          `We received a packet on port ${localPort}. We don't what to do yet, going to throw so the message isn't lost.`
      )
  }
}
