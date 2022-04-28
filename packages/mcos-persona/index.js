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

import { errorMessage } from 'mcos-shared'
import { logger } from 'mcos-shared/logger'
import { NPSMessage, NPSPersonaMapsMessage } from 'mcos-shared/types'
import { handleData, personaRecords } from './internal.js'

const log = logger.child({ service: 'mcoserver:PersonaServer' })

/**
 * Selects a game persona and marks it as in use
 * @param {NPSMessage} requestPacket
 * @returns {Promise<NPSMessage>}
 */
export async function handleSelectGamePersona (requestPacket) {
  log.debug('_npsSelectGamePersona...')
  log.debug(
    `NPSMsg request object from _npsSelectGamePersona: ${JSON.stringify({
      NPSMsg: requestPacket.toJSON()
    })}`
  )

  requestPacket.dumpPacket()

  // Create the packet content
  const packetContent = Buffer.alloc(251)

  // Build the packet
  // Response Code
  // 207 = success
  const responsePacket = new NPSMessage('sent')
  responsePacket.msgNo = 0x2_07
  responsePacket.setContent(packetContent)
  log.debug(
    `NPSMsg response object from _npsSelectGamePersona',
    ${JSON.stringify({
      NPSMsg: responsePacket.toJSON()
    })}`
  )

  responsePacket.dumpPacket()

  log.debug(
    `[npsSelectGamePersona] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
  )
  return Promise.resolve(responsePacket)
}

/**
 * Please use {@link PersonaServer.getInstance()}
 * @classdesc
 * @property {IPersonaRecord[]} personaList
 */
export class PersonaServer {
  /**
   *
   *
   * @static
   * @type {PersonaServer}
   * @memberof PersonaServer
   */
  static _instance

  /**
   * Return the instance of the Persona Server class
   * @returns {PersonaServer}
   */
  static getInstance () {
    if (!PersonaServer._instance) {
      PersonaServer._instance = new PersonaServer()
    }
    return PersonaServer._instance
  }

  /**
   * Create a new game persona record
   *
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   * @memberof PersonaServer
   */
  async createNewGameAccount (data) {
    const requestPacket = new NPSMessage('recieved').deserialize(data)
    log.debug(
      `NPSMsg request object from _npsNewGameAccount',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON()
      })}`
    )

    requestPacket.dumpPacket()

    const rPacket = new NPSMessage('sent')
    rPacket.msgNo = 0x6_01
    log.debug(
      `NPSMsg response object from _npsNewGameAccount',
      ${JSON.stringify({
        NPSMsg: rPacket.toJSON()
      })}`
    )

    rPacket.dumpPacket()

    return Promise.resolve(rPacket)
  }

  //  * TODO: Change the persona record to show logged out. This requires it to exist first, it is currently hard-coded
  //  * TODO: Locate the connection and delete, or reset it.
  /**
   * Log out a game persona
   *
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   * @memberof PersonaServer
   */
  async logoutGameUser (data) {
    log.debug('[personaServer] Logging out persona...')
    const requestPacket = new NPSMessage('recieved').deserialize(data)
    log.debug(
      `NPSMsg request object from _npsLogoutGameUser',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON()
      })}`
    )

    requestPacket.dumpPacket()

    // Create the packet content
    const packetContent = Buffer.alloc(257)

    // Build the packet
    const responsePacket = new NPSMessage('sent')
    responsePacket.msgNo = 0x6_12
    responsePacket.setContent(packetContent)
    log.debug(
      `NPSMsg response object from _npsLogoutGameUser',
      ${JSON.stringify({
        NPSMsg: responsePacket.toJSON()
      })}`
    )

    responsePacket.dumpPacket()

    log.debug(
      `[npsLogoutGameUser] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    )
    return Promise.resolve(responsePacket)
  }

  /**
   * Handle a check token packet
   *
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   * @memberof PersonaServer
   */
  async validateLicencePlate (data) {
    log.debug('_npsCheckToken...')
    const requestPacket = new NPSMessage('recieved').deserialize(data)
    log.debug(
      `NPSMsg request object from _npsCheckToken',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON()
      })}`
    )

    requestPacket.dumpPacket()

    const customerId = data.readInt32BE(12)
    const plateName = data.slice(17).toString()
    log.debug(`customerId: ${customerId}`) // skipcq: JS-0378
    log.debug(`Plate name: ${plateName}`) // skipcq: JS-0378

    // Create the packet content

    const packetContent = Buffer.alloc(256)

    // Build the packet
    // NPS_ACK = 207
    const responsePacket = new NPSMessage('sent')
    responsePacket.msgNo = 0x2_07
    responsePacket.setContent(packetContent)
    log.debug(
      `NPSMsg response object from _npsCheckToken',
      ${JSON.stringify({
        NPSMsg: responsePacket.toJSON()
      })}`
    )
    responsePacket.dumpPacket()

    log.debug(
      `[npsCheckToken] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    )
    return Promise.resolve(responsePacket)
  }

  /**
   * Handle a get persona maps packet
   *
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   */
  async validatePersonaName (data) {
    log.debug('_npsValidatePersonaName...')
    const requestPacket = new NPSMessage('recieved').deserialize(data)

    log.debug(
      `NPSMsg request object from _npsValidatePersonaName',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON()
      })}`
    )
    requestPacket.dumpPacket()

    const customerId = data.readInt32BE(12)
    const requestedPersonaName = data
      .slice(18, data.lastIndexOf(0x00))
      .toString()
    const serviceName = data.slice(data.indexOf(0x0a) + 1).toString() // skipcq: JS-0377
    log.debug(
      JSON.stringify({ customerId, requestedPersonaName, serviceName })
    )

    // Create the packet content
    // TODO: Create a real personas map packet, instead of using a fake one that (mostly) works

    const packetContent = Buffer.alloc(256)

    // Build the packet
    // NPS_USER_VALID     validation succeeded
    const responsePacket = new NPSMessage('sent')
    responsePacket.msgNo = 0x6_01
    responsePacket.setContent(packetContent)

    log.debug(
      `NPSMsg response object from _npsValidatePersonaName',
      ${JSON.stringify({
        NPSMsg: responsePacket.toJSON()
      })}`
    )
    responsePacket.dumpPacket()

    log.debug(
      `[npsValidatePersonaName] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    )
    return Promise.resolve(responsePacket)
  }

  /**
   *
   *
   * @param {import('node:net').Socket} socket
   * @param {NPSMessage} packet
   * @return {void}
   * @memberof PersonaServer
   */
  sendPacket (socket, packet) {
    try {
      // deepcode ignore WrongNumberOfArgs: False alert
      socket.write(packet.serialize())
    } catch (error) {
      if (error instanceof Error) {
        throw new TypeError(`Unable to send packet: ${error.message}`)
      }

      throw new Error('Unable to send packet, error unknown')
    }
  }

  /**
   *
   * @param {number} customerId
   * @return {Promise<import("mcos-shared/types").PersonaRecord[]>}
   */
  async getPersonasByCustomerId (customerId) {
    const results = personaRecords.filter(
      (persona) => persona.customerId === customerId
    )
    return Promise.resolve(results)
  }

  /**
   * Lookup all personas owned by the customer id
   *
   * TODO: Store in a database, instead of being hard-coded
   *
   * @param {number} customerId
   * @return {Promise<import("mcos-shared/types").PersonaRecord[]>}
   */
  async getPersonaMapsByCustomerId (customerId) {
    switch (customerId) {
      case 2_868_969_472:
      case 5_551_212:
        return this.getPersonasByCustomerId(customerId)
      default:
        return []
    }
  }

  /**
   * Handle a get persona maps packet
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   */
  async getPersonaMaps (data) {
    log.debug('_npsGetPersonaMaps...')
    const requestPacket = new NPSMessage('recieved').deserialize(data)

    log.debug(
      `NPSMsg request object from _npsGetPersonaMaps',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON()
      })}`
    )
    log.debug(
      `NPSMsg request object from _npsGetPersonaMaps',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON()
      })}`
    )
    requestPacket.dumpPacket()

    const customerId = Buffer.alloc(4)
    data.copy(customerId, 0, 12)
    const personas = await this.getPersonaMapsByCustomerId(
      customerId.readUInt32BE(0)
    )
    log.debug(
      `${personas.length} personas found for ${customerId.readUInt32BE(0)}`
    )

    const personaMapsMessage = new NPSPersonaMapsMessage('sent')

    if (personas.length === 0) {
      throw new Error(
        `No personas found for customer Id: ${customerId.readUInt32BE(0)}`
      )
    } else {
      try {
        personaMapsMessage.loadMaps(personas)

        const responsePacket = new NPSMessage('sent')
        responsePacket.msgNo = 0x6_07
        responsePacket.setContent(personaMapsMessage.serialize())
        log.debug(
          `NPSMsg response object from _npsGetPersonaMaps: ${JSON.stringify({
            NPSMsg: responsePacket.toJSON()
          })}`
        )

        responsePacket.dumpPacket()

        return responsePacket
      } catch (error) {
        if (error instanceof Error) {
          throw new TypeError(
            `Error serializing personaMapsMsg: ${error.message}`
          )
        }

        throw new Error('Error serializing personaMapsMsg, error unknonw')
      }
    }
  }

  /**
   * Handle inbound packets for the persona server
   *
   * @param {import("mcos-shared/types").UnprocessedPacket} rawPacket
   * @return {Promise<import("mcos-core").TCPConnection>}
   * @memberof PersonaServer
   */
  async dataHandler (rawPacket) {
    const { connection, data } = rawPacket
    const { sock, localPort, remoteAddress } = connection
    const updatedConnection = connection
    log.debug(
      `Received Persona packet',
      ${JSON.stringify({
        localPort,
        remoteAddress,
        data: rawPacket.data.toString('hex')
      })}`
    )
    const requestCode = data.readUInt16BE(0).toString(16)

    switch (requestCode) {
      case '503': {
        const requestPacket = new NPSMessage('recieved').deserialize(data)
        // NPS_REGISTER_GAME_LOGIN = 0x503
        const responsePacket = await handleSelectGamePersona(requestPacket)
        this.sendPacket(sock, responsePacket)
        return updatedConnection
      }

      case '507': {
        // NPS_NEW_GAME_ACCOUNT == 0x507
        const responsePacket = await this.createNewGameAccount(data)
        this.sendPacket(sock, responsePacket)
        return updatedConnection
      }

      case '50f': {
        // NPS_REGISTER_GAME_LOGOUT = 0x50F
        const responsePacket = await this.logoutGameUser(data)
        this.sendPacket(sock, responsePacket)
        return updatedConnection
      }

      case '532': {
        // NPS_GET_PERSONA_MAPS = 0x532
        const responsePacket = await this.getPersonaMaps(data)
        this.sendPacket(sock, responsePacket)
        return updatedConnection
      }

      case '533': {
        // NPS_VALIDATE_PERSONA_NAME   = 0x533
        const responsePacket = await this.validatePersonaName(data)
        this.sendPacket(sock, responsePacket)
        return updatedConnection
      }
      case '534': {
        // NPS_CHECK_TOKEN   = 0x534
        const responsePacket = await this.validateLicencePlate(data)
        this.sendPacket(sock, responsePacket)
        return updatedConnection
      }
    }
    throw new Error(
      `[personaServer] Unknown code was received ${JSON.stringify({
        requestCode,
        localPort
      })}`
    )
  }
}

/**
 * Entry and exit point for the persona service
 *
 * @export
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {Promise<import('mcos-shared/types').GServiceResponse>}
 */
export async function receivePersonaData (dataConnection) {
  try {
    const serviceResponse = await await handleData(dataConnection)
    return {
      err: null,
      response: serviceResponse
    }
  } catch (error) {
    const errMessage = `There was an error in the persona service: ${errorMessage(error)}`
    log.error(errMessage)
    return { err: new Error(errMessage), response: undefined }
  }
}

export { getPersonasByPersonaId } from './internal.js'
