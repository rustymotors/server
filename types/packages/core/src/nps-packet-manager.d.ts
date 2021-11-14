/**
 * @module npsPacketManager
 */
/**
 * @typedef IMsgNameMapping
 * @property {number} id
 * @property {string} name
 */
export class NPSPacketManager {
  database: DatabaseManager;
  /** @type {string} */
  npsKey: string;
  /** @type {IMsgNameMapping[]} */
  msgNameMapping: IMsgNameMapping[];
  /** @type {LoginServer} */
  loginServer: LoginServer;
  /** @type {PersonaServer} */
  personaServer: PersonaServer;
  /** @type {LobbyServer} */
  lobbyServer: LobbyServer;
  /**
   *
   * @param {number} msgId
   * @return {string}
   */
  msgCodetoName(messageId: any): string;
  /**
   *
   * @return {string}
   */
  getNPSKey(): string;
  /**
   *
   * @param {string} key
   */
  setNPSKey(key: string): void;
  /**
   *
   * @param {import("../../transactions/src/tcp-manager").UnprocessedPacket} rawPacket
   * @return {Promise<TCPConnection>}
   */
  processNPSPacket(
    rawPacket: import("../../transactions/src/tcp-manager").UnprocessedPacket
  ): Promise<TCPConnection>;
}
export type IMsgNameMapping = {
  id: number;
  name: string;
};
import { DatabaseManager } from "../../database/src/index";
import { LoginServer } from "../../login/src/index";
import { PersonaServer } from "../../persona/src/index";
import { LobbyServer } from "../../lobby/src/index";
import { TCPConnection } from "./tcpConnection";
