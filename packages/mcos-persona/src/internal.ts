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
import { BufferWithConnection, GSMessageArrayWithConnection, NPSMessage, NPSPersonaMapsMessage } from 'mcos-shared/types'
import { MessagePacket } from 'mcos-shared/structures'

const log = logger.child({ service: 'mcos:persona' })

const NAME_BUFFER_SIZE = 30

/**
 * Return string as buffer
 * @param {string} name
 * @param {number} size
 * @param {BufferEncoding} [encoding="utf8"]
 * @returns {Buffer}
 */
export function generateNameBuffer (name: string, size: number, encoding: BufferEncoding = 'utf8'): Buffer {
  const nameBuffer = Buffer.alloc(size)
  Buffer.from(name, encoding).copy(nameBuffer)
  return nameBuffer
}

/**
 * Return a list of all personas
 * @returns {import("mcos-shared/types").PersonaRecord[]}
 */
/** @type {import("mcos-shared/types").PersonaRecord[]} */
export const personaRecords = [
  {
    customerId: 2868969472,
    id: Buffer.from([0x00, 0x00, 0x00, 0x01]),
    maxPersonas: Buffer.from([0x01]),
    name: generateNameBuffer('Doc Joe', NAME_BUFFER_SIZE),
    personaCount: Buffer.from([0x00, 0x01]),
    shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c])
  },
  {
    customerId: 5551212,
    id: Buffer.from([0x00, 0x84, 0x5f, 0xed]),
    maxPersonas: Buffer.from([0x02]),
    name: generateNameBuffer('Dr Brown', NAME_BUFFER_SIZE),
    personaCount: Buffer.from([0x00, 0x01]),
    shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c])
  },
  {
    customerId: 5551212,
    id: Buffer.from([0x00, 0x84, 0x5f, 0xee]),
    maxPersonas: Buffer.from([0x02]),
    name: generateNameBuffer('Morty Dr', NAME_BUFFER_SIZE),
    personaCount: Buffer.from([0x00, 0x01]),
    shardId: Buffer.from([0x00, 0x00, 0x00, 0x2c])
  }
]

/**
   *
   * @param {number} id
   * @return {Promise<import("mcos-shared/types").PersonaRecord[]>}
   */
export async function getPersonasByPersonaId (id: number) {
  const results = personaRecords.filter((persona) => {
    const match = id === persona.id.readInt32BE(0)
    return match
  })
  if (results.length === 0) {
    throw new Error(`Unable to locate a persona for id: ${id}`)
  }

  return Promise.resolve(results)
}

/**
 * Selects a game persona and marks it as in use
 * @param {NPSMessage} requestPacket
 * @returns {Promise<NPSMessage>}
 */
export async function handleSelectGamePersona (requestPacket: NPSMessage): Promise<NPSMessage> {
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
 * Create a new game persona record
 *
 * @param {Buffer} data
 * @return {Promise<NPSMessage>}
 * @memberof PersonaServer
 */
async function createNewGameAccount (data: Buffer): Promise<NPSMessage> {
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
async function logoutGameUser (data: Buffer) {
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
   *
   * @param {number} customerId
   * @return {Promise<import("mcos-shared/types").PersonaRecord[]>}
   */
async function getPersonasByCustomerId (customerId: number) {
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
async function getPersonaMapsByCustomerId (customerId: number) {
  switch (customerId) {
    case 2_868_969_472:
    case 5_551_212:
      return getPersonasByCustomerId(customerId)
    default:
      return []
  }
}

/**
   * Handle a get persona maps packet
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   */
async function getPersonaMaps (data: Buffer) {
  log.debug('_npsGetPersonaMaps...')
  const requestPacket = new NPSMessage('recieved').deserialize(data)

  log.debug(
      `NPSMsg request object from _npsGetPersonaMaps',
      ${JSON.stringify({
        NPSMsg: requestPacket.toJSON()
      })}`
  )

  requestPacket.dumpPacket()

  const customerId = Buffer.alloc(4)
  data.copy(customerId, 0, 12)
  const personas = await getPersonaMapsByCustomerId(
    customerId.readUInt32BE(0)
  )
  log.debug(
      `${personas.length} personas found for ${customerId.readUInt32BE(0)}`
  )

  const personaMapsMessage = new NPSPersonaMapsMessage('sent')

  // this is a GLDP_PersonaList::GLDP_PersonaList

  // TODO: I think this is a list of _UserGameData

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

      const personaMapsPacket = MessagePacket.fromBuffer(responsePacket.serialize())

      log.debug(`!!! outbound persona maps response packet: ${personaMapsPacket.buffer.toString("hex")}`)

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
   * Check if valid name for new user
   *
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   */
async function validatePersonaName (data: Buffer) {
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
   * Handle a check token packet
   *
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   * @memberof PersonaServer
   */
async function validateLicencePlate (data: Buffer) {
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
 *
 *
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {Promise<import('mcos-shared/types').GSMessageArrayWithConnection>}
 */
export async function handleData (dataConnection: BufferWithConnection): Promise<GSMessageArrayWithConnection> {
  const { connection, data } = dataConnection
  const { socket, localPort } = connection
  log.debug(
    `Received Persona packet',
    ${JSON.stringify({
      localPort,
      remoteAddress: socket.remoteAddress,
      data: data.toString('hex')
    })}`
  )
  const requestCode = data.readUInt16BE(0).toString(16)

  switch (requestCode) {
    case '503': {
      const requestPacket = new NPSMessage('recieved').deserialize(data)
      // NPS_REGISTER_GAME_LOGIN = 0x503
      const responsePacket = await handleSelectGamePersona(requestPacket)
      /** @type {import('mcos-shared/types').GSMessageArrayWithConnection} */
      const response = {
        connection: dataConnection.connection,
        messages: [responsePacket]
      }
      return response
    }

    case '507': {
      // NPS_NEW_GAME_ACCOUNT == 0x507
      const responsePacket = await createNewGameAccount(data)
      /** @type {import('mcos-shared/types').GSMessageArrayWithConnection} */
      const response = {
        connection: dataConnection.connection,
        messages: [responsePacket]
      }
      return response
    }

    case '50f': {
      // NPS_REGISTER_GAME_LOGOUT = 0x50F
      const responsePacket = await logoutGameUser(data)
      /** @type {import('mcos-shared/types').GSMessageArrayWithConnection} */
      const response = {
        connection: dataConnection.connection,
        messages: [responsePacket]
      }
      return response
    }

    case '532': {
      // NPS_GET_PERSONA_MAPS = 0x532
      const responsePacket = await getPersonaMaps(data)
      /** @type {import('mcos-shared/types').GSMessageArrayWithConnection} */
      const response = {
        connection: dataConnection.connection,
        messages: [responsePacket]
      }
      return response
    }

    case '533': {
      // NPS_VALIDATE_PERSONA_NAME   = 0x533
      const responsePacket = await validatePersonaName(data)
      /** @type {import('mcos-shared/types').GSMessageArrayWithConnection} */
      const response = {
        connection: dataConnection.connection,
        messages: [responsePacket]
      }
      return response
    }
    case '534': {
      // NPS_CHECK_TOKEN   = 0x534
      const responsePacket = await validateLicencePlate(data)
      /** @type {import('mcos-shared/types').GSMessageArrayWithConnection} */
      const response = {
        connection: dataConnection.connection,
        messages: [responsePacket]
      }
      return response
    }
  }
  throw new Error(
    `[personaServer] Unknown code was received ${JSON.stringify({
      requestCode,
      localPort: socket.localPort
    })}`
  )
}
