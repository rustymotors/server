/// <reference types="node" />
import { ITCPConnection, UnprocessedPacket } from "../../types/src/index";
import { NPSMessage } from "../../message-types/src/index";
/**
 * @class
 */
export declare class LobbyServer {
    static _instance: LobbyServer;
    static getInstance(): LobbyServer;
    private constructor();
    /**
     * @return NPSMsg}
     */
    _npsHeartbeat(): NPSMessage;
    /**
     * @param {IRawPacket} rawPacket
     * @return {Promise<ConnectionObj>}
     */
    dataHandler(rawPacket: UnprocessedPacket): Promise<ITCPConnection>;
    /**
     * @param {string} key
     * @return {Buffer}
     */
    _generateSessionKeyBuffer(key: string): Buffer;
    /**
     * Handle a request to connect to a game server packet
     *
     * @param {ConnectionObj} connection
     * @param {Buffer} rawData
     * @return {Promise<NPSMsg>}
     */
    _npsRequestGameConnectServer(connection: ITCPConnection, rawData: Buffer): Promise<NPSMessage>;
}
