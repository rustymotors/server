/// <reference types="node" />
/**
 */
/**
 * @class
 * @property {IPersonaRecord[]} personaList
 */
export class PersonaServer {
  static _instance: any
  /**
   *
   * @returns {PersonaServer}
   */
  static getInstance(): PersonaServer
  constructor(isNew?: boolean)
  personaList: {
    customerId: number
    id: Buffer
    maxPersonas: Buffer
    name: Buffer
    personaCount: Buffer
    shardId: Buffer
  }[]
  serviceName: string
  /**
   *
   * @param {string} name
   * @returns {Buffer}
   */
  _generateNameBuffer(name: string): Buffer
  /**
   *
   * @param {Buffer} data
   * @returns {Promise<NPSMessage>}
   */
  handleSelectGamePersona(data: Buffer): Promise<NPSMessage>
  /**
   *
   * @param {Buffer} data
   * @returns {Promise<NPSMessage>}
   */
  createNewGameAccount(data: Buffer): Promise<NPSMessage>
  /**
   *
   * @param {Buffer} data
   * @returns {Promise<NPSMessage>}
   */
  logoutGameUser(data: Buffer): Promise<NPSMessage>
  /**
   * Handle a check token packet
   *
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   */
  validateLicencePlate(data: Buffer): Promise<NPSMessage>
  /**
   * Handle a get persona maps packet
   *
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   */
  validatePersonaName(data: Buffer): Promise<NPSMessage>
  /**
   *
   *
   * @param {Socket} socket
   * @param {NPSMessage} packet
   * @return {void}
   */
  sendPacket(socket: Socket, packet: NPSMessage): void
  /**
   *
   * @param {number} customerId
   * @return {Promise<IPersonaRecord[]>}
   */
  getPersonasByCustomerId(customerId: number): Promise<any[]>
  /**
   *
   * @param {number} id
   * @return {Promise<IPersonaRecord[]>}
   */
  getPersonasByPersonaId(id: number): Promise<any[]>
  /**
   * Lookup all personas owned by the customer id
   * TODO: Store in a database, instead of being hard-coded
   *
   * @param {number} customerId
   * @return {Promise<IPersonaRecord[]>}
   */
  getPersonaMapsByCustomerId(customerId: number): Promise<any[]>
  /**
   * Handle a get persona maps packet
   * @param {Buffer} data
   * @return {Promise<NPSMessage>}
   */
  getPersonaMaps(data: Buffer): Promise<NPSMessage>
  /**
   *
   * @param {IRawPacket} rawPacket
   * @returns {Promise<TCPConnection>}
   */
  dataHandler(rawPacket: any): Promise<TCPConnection>
}
import { Buffer } from 'buffer'
import { NPSMessage } from '../MCOTS/nps-msg.js'
import { Socket } from 'net'
import { TCPConnection } from '../MCServer/tcpConnection.js'
