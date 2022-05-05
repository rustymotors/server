/**
 * @module npsPacketManager
 */
/**
 * @export
 * @typedef IMsgNameMapping
 * @property {number} id
 * @property {string} name
 */
/**
 *  Handles incoming NPS packets
 *
 * @export
 * @class NPSPacketManager
 */
export class NPSPacketManager {
    database: DatabaseManager;
    npsKey: string;
    msgNameMapping: {
        id: number;
        name: string;
    }[];
    loginServer: LoginServer;
    personaServer: PersonaServer;
    lobbyServer: LobbyServer;
    /**
     *
     * @param {number} messageId
     * @return {string}
     */
    msgCodetoName(messageId: number): string;
    /**
     *
     * @return {string}
     */
    getNPSKey(): string;
    /**
     *
     * @param {string} key
     * @return {void}
     */
    setNPSKey(key: string): void;
    /**
     *
     * @param {{connection: import("mcos-shared").TCPConnection, data: Buffer}} rawPacket
     * @return {Promise<import("mcos-shared").TCPConnection>}
     */
    processNPSPacket(rawPacket: {
        connection: import("mcos-shared").TCPConnection;
        data: Buffer;
    }): Promise<import("mcos-shared").TCPConnection>;
}
export type IMsgNameMapping = {
    id: number;
    name: string;
};
import { DatabaseManager } from "mcos-database";
import { LoginServer } from "mcos-login";
import { PersonaServer } from "mcos-persona";
import { LobbyServer } from "mcos-lobby";
//# sourceMappingURL=nps-packet-manager.d.ts.map