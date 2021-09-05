export class NPSPacketManager {
  database: DatabaseManager
  npsKey: string
  msgNameMapping: {
    id: number
    name: string
  }[]
  loginServer: LoginServer
  personaServer: PersonaServer
  lobbyServer: LobbyServer
  serviceName: string
  /**
   *
   * @param {number} messageId
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
   * @return {Promise<TCPConnection>}
   */
  processNPSPacket(rawPacket: any): Promise<TCPConnection>
}
import { DatabaseManager } from '../shared/database-manager.js'
import { LoginServer } from '../LoginServer/index.js'
import { PersonaServer } from '../PersonaServer/persona-server.js'
import { LobbyServer } from '../LobbyServer/index.js'
import { TCPConnection } from './tcpConnection.js'
