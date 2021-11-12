import { ITCPConnection, UnprocessedPacket } from "../../types/src/index";
import { LobbyServer } from "../../lobby/src/index";
import { LoginServer } from "../../login/src/index";
import { PersonaServer } from "../../persona/src/index";
import { DatabaseManager } from "../../database/src/index";
/**
 * @module npsPacketManager
 */
/**
 * @typedef IMsgNameMapping
 * @property {number} id
 * @property {string} name
 */
export interface IMsgNameMapping {
    id: number;
    name: string;
}
export declare class NPSPacketManager {
    database: DatabaseManager;
    npsKey: string;
    msgNameMapping: IMsgNameMapping[];
    loginServer: LoginServer;
    personaServer: PersonaServer;
    lobbyServer: LobbyServer;
    constructor();
    /**
     *
     * @param {number} msgId
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
     * @param {module:IRawPacket} rawPacket
     * @return {Promise<ConnectionObj>}
     */
    processNPSPacket(rawPacket: UnprocessedPacket): Promise<ITCPConnection>;
}
