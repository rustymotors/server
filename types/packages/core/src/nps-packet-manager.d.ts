export type IMsgNameMapping = {
    id: number;
    name: string;
};
/**
 * @module npsPacketManager
 */
/**
 * @typedef IMsgNameMapping
 * @property {number} id
 * @property {string} name
 */
export class NPSPacketManager {
    /** @type {NPSPacketManager} */
    static _instance: NPSPacketManager;
    /**
     *
     * @returns {NPSPacketManager}
     */
    static getInstance(): NPSPacketManager;
    /** @type {string} */
    npsKey: string;
    /** @type {IMsgNameMapping[]} */
    msgNameMapping: IMsgNameMapping[];
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
     */
    setNPSKey(key: string): void;
    /**
     *
     * @param {import("../../transactions/src/types").UnprocessedPacket} rawPacket
     * @param {import("../../login/src/index").LoginServer} loginServer
     * @param {import("../../persona/src/index").PersonaServer} personaServer
     * @param {import("../../lobby/src/index").LobbyServer} lobbyServer
     * @param {import("../../database/src/index").DatabaseManager} databaseManager
     * @return {Promise<import("../../core/src/tcpConnection").TCPConnection>}
     */
    processNPSPacket(rawPacket: import("../../transactions/src/types").UnprocessedPacket, loginServer: import("../../login/src/index").LoginServer, personaServer: import("../../persona/src/index").PersonaServer, lobbyServer: import("../../lobby/src/index").LobbyServer, databaseManager: import("../../database/src/index").DatabaseManager): Promise<import("../../core/src/tcpConnection").TCPConnection>;
}
