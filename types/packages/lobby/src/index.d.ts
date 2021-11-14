/// <reference types="node" />
/**
 * @class
 */
export class LobbyServer {
    /** @type {LobbyServer} */
    static _instance: LobbyServer;
    /**
     *
     * @returns {LobbyServer}
     */
    static getInstance(): LobbyServer;
    /**
     * @return {NPSMessage}
     */
    _npsHeartbeat(): any;
    /**
     * @param {import("../../transactions/src/types").UnprocessedPacket} rawPacket
     * @param {import("../../persona/src/index").PersonaServer} personaServer
     * @param {import("../../database/src/index").DatabaseManager} databaseManager
     * @return {Promise<import("../../core/src/tcpConnection").TCPConnection>}
     */
    dataHandler(rawPacket: any, personaServer: any, databaseManager: import("../../database/src/index").DatabaseManager): Promise<import("../../core/src/tcpConnection").TCPConnection>;
    /**
     * @param {string} key
     * @return {Buffer}
     */
    _generateSessionKeyBuffer(key: string): Buffer;
    /**
     * Handle a request to connect to a game server packet
     *
     * @param {import("../../core/src/tcpConnection").TCPConnection} connection
     * @param {import("../../persona/src/index").PersonaServer} personaServer
     * @param {import("../../database/src/index").DatabaseManager} databaseManager
     * @param {Buffer} rawData
     * @return {Promise<NPSMessage>}
     */
    _npsRequestGameConnectServer(connection: import("../../core/src/tcpConnection").TCPConnection, rawData: Buffer, personaServer: any, databaseManager: import("../../database/src/index").DatabaseManager): Promise<any>;
}
import { Buffer } from "buffer";
