import { IRawPacket } from '../../src/types'
import { LobbyServer } from '../LobbyServer'
import { LoginServer } from '../LoginServer'
import { PersonaServer } from '../PersonaServer/persona-server'
import { DatabaseManager } from '../shared/database-manager'
import { TCPConnection } from './tcpConnection'
/**
 * @module npsPacketManager
 */
/**
 * @typedef IMsgNameMapping
 * @property {number} id
 * @property {string} name
 */
export interface IMsgNameMapping {
  id: number
  name: string
}
export declare class NPSPacketManager {
  database: DatabaseManager
  npsKey: string
  msgNameMapping: IMsgNameMapping[]
  loginServer: LoginServer
  personaServer: PersonaServer
  lobbyServer: LobbyServer
  serviceName: string
  constructor()
  /**
   *
   * @param {number} msgId
   * @return {string}
   */
  msgCodetoName(messageId: number): string
  /**
   *
   * @return {string}
   */
  getNPSKey(): string
  /**
   *
   * @param {string} key
   * @return {void}
   */
  setNPSKey(key: string): void
  /**
   *
   * @param {module:IRawPacket} rawPacket
   * @return {Promise<ConnectionObj>}
   */
  processNPSPacket(rawPacket: IRawPacket): Promise<TCPConnection>
}
