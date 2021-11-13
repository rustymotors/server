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
    _npsHeartbeat(): NPSMessage;
    /**
     * @param {import("../../transactions/src/tcp-manager").UnprocessedPacket} rawPacket
     * @return {Promise<TCPConnection>}
     */
    dataHandler(rawPacket: import("../../transactions/src/tcp-manager").UnprocessedPacket): Promise<TCPConnection>;
    /**
     * @param {string} key
     * @return {Buffer}
     */
    _generateSessionKeyBuffer(key: string): Buffer;
    /**
     * Handle a request to connect to a game server packet
     *
     * @param {TCPConnection} connection
     * @param {Buffer} rawData
     * @return {Promise<NPSMessage>}
     */
    _npsRequestGameConnectServer(connection: TCPConnection, rawData: Buffer): Promise<NPSMessage>;
}
import { NPSMessage } from "../../message-types/src/index";
import { TCPConnection } from "../../core/src/tcpConnection";
import { Buffer } from "buffer";
