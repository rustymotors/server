// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const { NPSMsg } = require('../MCOTS/NPSMsg')
const { NPSPersonaMapsMsg } = require('./NPSPersonaMapsMsg')
const logger = require('../../@mcoserver/mco-logger').child({ service: 'mcoserver:PersonaServer' })

/**
 * @module PersonaServer
 */

/**
 * @class
 * @property {IPersonaRecord[]} personaList
 */
class PersonaServer {
  constructor () {
    this.personaList = [
      {
        customerId: 2868969472,
        id: Buffer.from([0x00, 0x00, 0x00, 0x01]),
        maxPersonas: Buffer.from([0x01]),
        name: this._generateNameBuffer('Doc Joe'),
        personaCount: Buffer.from([0x00, 0x01]),
        shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c])
      },
      {
        customerId: 5551212,
        id: Buffer.from([0x00, 0x84, 0x5f, 0xed]),
        maxPersonas: Buffer.from([0x02]),
        name: this._generateNameBuffer('Dr Brown'),
        personaCount: Buffer.from([0x00, 0x01]),
        shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c])
      },
      {
        customerId: 5551212,
        id: Buffer.from([0x00, 0x84, 0x5f, 0xee]),
        maxPersonas: Buffer.from([0x02]),
        name: this._generateNameBuffer('Morty Dr'),
        personaCount: Buffer.from([0x00, 0x01]),
        shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c])
      }
    ]
  }

  /**
   *
   * @param {string} name
   * @return {Buffer}
   */
  _generateNameBuffer (name) {
    const nameBuffer = Buffer.alloc(30)
    Buffer.from(name, 'utf8').copy(nameBuffer)
    return nameBuffer
  }

  /**
   * Handle a select game persona packet
   *
   * @param {Buffer} data
   * @returns {Promise<NPSMsg>}
   */
  async _npsSelectGamePersona (data) {
    logger.info('_npsSelectGamePersona...')
    const requestPacket = new NPSMsg('RECEIVED').deserialize(data)
    logger.debug(
      `NPSMsg request object from _npsSelectGamePersona: ${{
        NPSMsg: requestPacket.toJSON()
      }}`)

    requestPacket.dumpPacket()

    // Create the packet content
    const packetContent = Buffer.alloc(251)

    // Build the packet
    // Response Code
    // 207 = success
    const responsePacket = new NPSMsg('SENT')
    responsePacket.msgNo = 0x207
    responsePacket.setContent(packetContent)
    logger.debug(
      'NPSMsg response object from _npsSelectGamePersona',
      {
        NPSMsg: responsePacket.toJSON()
      }
    )

    responsePacket.dumpPacket()

    logger.debug(
      `[npsSelectGamePersona] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    )
    return responsePacket
  }

  /**
   *
   * @param {Buffer} data
   * @returns {Promise<NPSMsg>}
   */
  async _npsNewGameAccount (data) {
    const requestPacket = new NPSMsg('RECEIVED').deserialize(data)
    logger.debug(
      'NPSMsg request object from _npsNewGameAccount',
      {
        NPSMsg: requestPacket.toJSON()
      }
    )

    requestPacket.dumpPacket()

    const rPacket = new NPSMsg('SENT')
    rPacket.msgNo = 0x601
    logger.debug(
      'NPSMsg response object from _npsNewGameAccount',
      {
        NPSMsg: rPacket.toJSON()
      }
    )

    rPacket.dumpPacket()

    return rPacket
  }

  /**
   * Mark a persona as logged out
   * TODO: Change the persona record to show logged out. This requires it to exist first, it is currently hard-coded
   * TODO: Locate the connection and delete, or reset it.
   *
   * @param {Buffer} data
   * @returns {Promise<NPSMsg>}
   */
  async _npsLogoutGameUser (data) {
    logger.debug('[personaServer] Logging out persona...')
    const requestPacket = new NPSMsg('RECEIVED').deserialize(data)
    logger.debug(
      'NPSMsg request object from _npsLogoutGameUser',
      {
        NPSMsg: requestPacket.toJSON()
      }
    )

    requestPacket.dumpPacket()

    // Create the packet content
    const packetContent = Buffer.alloc(257)

    // Build the packet
    const responsePacket = new NPSMsg('SENT')
    responsePacket.msgNo = 0x612
    responsePacket.setContent(packetContent)
    logger.debug(
      'NPSMsg response object from _npsLogoutGameUser',
      {
        NPSMsg: responsePacket.toJSON()
      }
    )

    responsePacket.dumpPacket()

    logger.debug(
      `[npsLogoutGameUser] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    )
    return responsePacket
  }

  /**
   * Handle a check token packet
   *
   * @param {Buffer} data
   * @returns {Promise<NPSMsg>}
   */
  async _npsCheckToken (data) {
    logger.info('_npsCheckToken...')
    const requestPacket = new NPSMsg('RECEIVED').deserialize(data)
    logger.debug(
      'NPSMsg request object from _npsCheckToken',
      {
        NPSMsg: requestPacket.toJSON()
      }
    )

    requestPacket.dumpPacket()

    const customerId = data.readInt32BE(12)
    const plateName = data.slice(17).toString()
    logger.debug(`customerId: ${customerId}`)
    logger.debug(`Plate name: ${plateName}`)

    // Create the packet content

    const packetContent = Buffer.alloc(256)

    // Build the packet
    // NPS_ACK = 207
    const responsePacket = new NPSMsg('SENT')
    responsePacket.msgNo = 0x207
    responsePacket.setContent(packetContent)
    logger.debug(
      'NPSMsg response object from _npsCheckToken',
      {
        NPSMsg: responsePacket.toJSON()
      }
    )
    responsePacket.dumpPacket()

    logger.debug(
      `[npsCheckToken] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    )
    return responsePacket
  }

  /**
   * Handle a get persona maps packet
   *
   * @param {Buffer} data
   * @returns {Promise<NPSMsg>}
   */
  async _npsValidatePersonaName (data) {
    logger.debug('_npsValidatePersonaName...')
    const requestPacket = new NPSMsg('RECEIVED').deserialize(data)

    logger.debug(
      'NPSMsg request object from _npsValidatePersonaName',
      {
        NPSMsg: requestPacket.toJSON()
      }
    )
    requestPacket.dumpPacket()

    const customerId = data.readInt32BE(12)
    const requestedPersonaName = data
      .slice(18, data.lastIndexOf(0x00))
      .toString()
    const serviceName = data.slice(data.indexOf(0x0a) + 1).toString()
    logger.debug({ customerId, requestedPersonaName, serviceName })

    // Create the packet content
    // TODO: Create a real personas map packet, instead of using a fake one that (mostly) works

    const packetContent = Buffer.alloc(256)

    // Build the packet
    // NPS_USER_VALID     validation succeeded
    const responsePacket = new NPSMsg('SENT')
    responsePacket.msgNo = 0x601
    responsePacket.setContent(packetContent)

    logger.debug(
      'NPSMsg response object from _npsValidatePersonaName',
      {
        NPSMsg: responsePacket.toJSON()
      }
    )
    responsePacket.dumpPacket()

    logger.debug(
      `[npsValidatePersonaName] responsePacket's data prior to sending: ${responsePacket.getPacketAsString()}`
    )
    return responsePacket
  }

  /**
   *
   *
   * @param {Socket} socket
   * @param {NPSMsg} packet
   * @returns {void}
   * @memberof PersonaServer
   */
  _send (socket, packet) {
    try {
      socket.write(packet.serialize())
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Unable to send packet: ${error}`)
      }
      throw new Error('Unable to send packet, error unknown')
    }
  }

  /**
   *
   * @param {number} customerId
   * @return {Promise<IPersonaRecord[]>}
   */
  async _getPersonasByCustomerId (customerId) {
    const results = this.personaList.filter(persona => {
      return persona.customerId === customerId
    })
    if (results.length === 0) {
      throw new Error(
        `Unable to locate a persona for customerId: ${customerId}`
      )
    }
    return results
  }

  /**
   *
   * @param {number} id
   * @return {Promise<IPersonaRecord[]>}
   */
  async _getPersonasById (id) {
    const results = this.personaList.filter(persona => {
      const match = id === persona.id.readInt32BE(0)
      return match
    })
    if (results.length === 0) {
      throw new Error(`Unable to locate a persona for id: ${id}`)
    }
    return results
  }

  /**
   * Lookup all personas owned by the customer id
   * TODO: Store in a database, instead of being hard-coded
   *
   * @param {number} customerId
   * @returns {Promise<IPersonaRecord[]>}
   */
  async _npsGetPersonaMapsByCustomerId (customerId) {
    switch (customerId) {
      case 2868969472:
      case 5551212:
        return this._getPersonasByCustomerId(customerId)
      default:
        return []
    }
  }

  /**
   * Handle a get persona maps packet
   * @param {Buffer} data
   * @returns {Promise<NPSMsg>}
   */
  async _npsGetPersonaMaps (data) {
    logger.debug('_npsGetPersonaMaps...')
    const requestPacket = new NPSMsg('RECEIVED').deserialize(data)

    logger.debug('NPSMsg request object from _npsGetPersonaMaps',
      {
        NPSMsg: requestPacket.toJSON()
      })
    logger.debug(
      'NPSMsg request object from _npsGetPersonaMaps',
      {
        NPSMsg: requestPacket.toJSON()
      }
    )
    requestPacket.dumpPacket()

    const customerId = Buffer.alloc(4)
    data.copy(customerId, 0, 12)
    const personas = await this._npsGetPersonaMapsByCustomerId(
      customerId.readUInt32BE(0)
    )
    logger.debug(
      `${personas.length} personas found for ${customerId.readUInt32BE(0)}`
    )

    let responsePacket

    const personaMapsMsg = new NPSPersonaMapsMsg('SENT')

    if (personas.length === 0) {
      throw new Error(
        `No personas found for customer Id: ${customerId.readUInt32BE(0)}`
      )
    } else {
      try {
        personaMapsMsg.loadMaps(personas)

        responsePacket = new NPSMsg('SENT')
        responsePacket.msgNo = 0x607
        responsePacket.setContent(personaMapsMsg.serialize())
        logger.debug(
          `NPSMsg response object from _npsGetPersonaMaps: ${{
            NPSMsg: responsePacket.toJSON()
          }
          }`
        )

        responsePacket.dumpPacket()
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Error serializing personaMapsMsg: ${error}`)
        }
        throw new Error('Error serializing personaMapsMsg, error unknonw')
      }
    }
    return responsePacket
  }

  /**
   * Route an incoming persona packet to the connect handler
   *
   * @param {IRawPacket} rawPacket
   * @returns {Promise<ConnectionObj>}
   */
  async dataHandler (rawPacket) {
    const { connection, data, localPort, remoteAddress } = rawPacket
    const { sock } = connection
    const updatedConnection = connection
    logger.debug(
      'Received Persona packet',
      { localPort, remoteAddress, data: rawPacket.data.toString('hex') }
    )
    const requestCode = data.readUInt16BE(0).toString(16)
    let responsePacket

    switch (requestCode) {
      case '503':
        // NPS_REGISTER_GAME_LOGIN = 0x503
        responsePacket = await this._npsSelectGamePersona(data)
        this._send(sock, responsePacket)
        return updatedConnection

      case '507':
        // NPS_NEW_GAME_ACCOUNT == 0x507
        responsePacket = await this._npsNewGameAccount(data)
        this._send(sock, responsePacket)
        return updatedConnection

      case '50f':
        // NPS_REGISTER_GAME_LOGOUT = 0x50F
        responsePacket = await this._npsLogoutGameUser(data)
        this._send(sock, responsePacket)
        return updatedConnection

      case '532':
        // NPS_GET_PERSONA_MAPS = 0x532
        responsePacket = await this._npsGetPersonaMaps(data)
        this._send(sock, responsePacket)
        return updatedConnection

      case '533':
        // NPS_VALIDATE_PERSONA_NAME   = 0x533
        responsePacket = await this._npsValidatePersonaName(data)
        this._send(sock, responsePacket)
        return updatedConnection

      case '534':
        // NPS_CHECK_TOKEN   = 0x534
        responsePacket = await this._npsCheckToken(data)
        this._send(sock, responsePacket)
        return updatedConnection

      default:
        throw new Error(
          `[personaServer] Unknown code was received ${{
            requestCode,
            localPort
          }}`
        )
    }
  }
}
module.exports.PersonaServer = PersonaServer
