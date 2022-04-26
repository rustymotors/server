// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { logger } from 'mcos-shared/logger'
import { errorMessage } from 'mcos-shared'
import { selectConnection, updateConnection } from './connections.js'
import { recieveLoginData } from 'mcos-login'
import { recievePersonaData } from 'mcos-persona'

const log = logger.child({ service: 'mcos:gateway:sockets' })

/**
   * Attempt to write packet(s) to the socket
   * @param {import("mcos-shared/types").BufferWithConnection} dataConnection
   * @returns {import('mcos-shared/types').BufferWithConnection}
   */
function tryWritePackets (dataConnection) {
  log.debug('In trywritepackets')

  // Does the packet need to be compressed?
  /** @type {import("mcos-shared/types").BufferWithConnection} */
  const compressedPacket = compressIfNeeded(dataConnection)
  // Does the packet need to be encrypted?
  const encryptedPacket = encryptIfNeeded(compressedPacket)
  // Log that we are trying to write
  log.debug(
        ` Atempting to write seq: ${encryptedPacket.connection.seq} to conn: ${dataConnection.connectionId}`
  )

  // Log the buffer we are writing
  log.debug(
        `Writting buffer: ${encryptedPacket.data.toString('hex')}`
  )
  if (encryptedPacket.connection.socket.writable) {
    // Write the packet to socket
    encryptedPacket.connection.socket.write(encryptedPacket.data)
  } else {
    /** @type {string} */
    const port = encryptedPacket.connection.socket.localPort?.toString() || ''
    throw new Error(
          `Error writing ${encryptedPacket.data.toString('hex')} to ${
            encryptedPacket.connection.socket.remoteAddress
          } , ${port}`
    )
  }

  return encryptedPacket
}

/**
   * The onData handler
   * takes the data buffer and creates a {@link BufferWithConnection} object
   * @param {Buffer} data
   * @param {import('mcos-shared/types').SocketWithConnectionInfo} connection
   * @return {Promise<void>}
   */
async function onData (data, connection) {
  log.debug(
      `data prior to proccessing: ${data.toString(
        'hex'
      )}`
  )

  // Link the data and the connection together
  /** @type {import("mcos-shared/types").BufferWithConnection} */
  const networkBuffer = {
    connectionId: connection.id,
    connection,
    data,
    timestamp: Date.now()
  }

  const { localPort } = networkBuffer.connection.socket

  if (typeof localPort === 'undefined') {
    // Somehow we have recived a connection without a local post specified
    log.error(`Error locating target port for socket, connection id: ${networkBuffer.connectionId}`)
    log.error('Closing socket.')
    networkBuffer.connection.socket.end()
    return
  }

  /** @type {{errMessage: string | null, data: import("mcos-shared/types").BufferWithConnection | null}} */
  let result = { errMessage: null, data: null }

  // Route the data to the correct service
  if (localPort === 8226) {
    result = await recieveLoginData(networkBuffer)
    log.debug('Back in socket manager')
  }

  if (localPort === 8228) {
    result = await recievePersonaData(networkBuffer)
    log.debug('Back in socket manager')
  }

  if (localPort === 7003) {
    result = await recieveLobbyData(networkBuffer)
    log.debug('Back in socket manager')
  }

  if (result.errMessage || result.data === null) {
    log.error(errorMessage(result.errMessage))
    throw new Error(
        `There was an error processing the packet: ${result.errMessage}`
    )
  }

  // At this point the packets should be read to go. Compressed, encrypted, etc.

  // We should check them one last time

  // Does packet type and header match the type expected for this port?
  // * 8226, 8228, 7003 should be NPS
  // * all other ports should be MCOT

  // const requestPort = result.data.connection.socket.localPort
  // const isPacketReady = validatePacketType(requestPort, result.data.data)

  const sentConnection = tryWritePackets(result.data)

  // Update the connection
  try {
    updateConnection(
      sentConnection.connectionId,
      sentConnection.connection
    )
  } catch (error) {
    if (error instanceof Error) {
      const newError = new Error(
          `There was an error updating the connection: ${error.message}`
      )
      log.error(newError.message)
      throw newError
    }
    throw error
  }
}

/**
   * Server listener method
   *
   * @param {import("node:net").Socket} socket
   * @return {void}
   */
export function socketListener (socket) {
  // Received a new connection
  // Turn it into a connection object
  const connectionRecord = selectConnection(socket)

  const { localPort, remoteAddress } = socket
  log.info(`Client ${remoteAddress} connected to port ${localPort}`)
  if (socket.localPort === 7003 && connectionRecord.inQueue) {
    /**
       * Debug seems hard-coded to use the connection queue
       * Craft a packet that tells the client it's allowed to login
       */

    log.info('Sending OK to Login packet')
    socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]))
    connectionRecord.inQueue = false
  }

  socket.on('end', () => {
    log.info(`Client ${remoteAddress} disconnected from port ${localPort}`)
  })
  socket.on('data', (/** @type {Buffer} */ data) => {
    onData(data, connectionRecord)
  })
  socket.on('error', (/** @type {unknown} */ error) => {
    const message = errorMessage(error)
    if (message.includes('ECONNRESET')) {
      return log.warn('Connection was reset')
    }
    log.error(`Socket error: ${errorMessage(error)}`)
  })
}

/**
   * Validate the packet is ready to send
   *
   * @param {number | undefined} requestPort
   * @param {Buffer} data
   * @return {boolean}
   */
// function validatePacketType (requestPort, data) {
//   // Log error and return false of requestPort is undefined
//   if (typeof requestPort === 'undefined') {
//     log.error('Unable to validate packet, no port!')
//     return false
//   }

//   let packetType = ''

//   if (requestPort <= 8228) {
//     packetType = 'NPS'
//     validateNPSPacket(data)
//   }

//   packetType = 'MCOT'
//   validateTSPacket(data)

//   // Check type

//   // Check header

//   // Check length

//   // If requestPort is 7003, 8225, or 8228, the matchet should match an NPS packet

//   // Log that packet is good to send
//   log.debug(`Valid packet type of ${packetType} ready to send on port ${requestPort}`)

//   return true
// }

/**
 *
 *
 * @param {Buffer} data
 */
// function validateNPSPacket (data) {
//   throw new Error('Function not implemented.')
// }

/**
 *
 *
 * @param {Buffer} data
 */
// function validateTSPacket (data) {
//   throw new Error('Function not implemented.')
// }

/**
 * TODO: Write compressor
 *
 * Uses PWARE DCL Explode
 *
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {import('mcos-shared/types').BufferWithConnection}
 */
function compressIfNeeded (dataConnection) {
  return dataConnection
}

/**
 * TODO: Encript if needed
 *
 * Encrypt the packet if the connection says so.
 *
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {import('mcos-shared/types').BufferWithConnection}
 */
function encryptIfNeeded (dataConnection) {
  return dataConnection
}
