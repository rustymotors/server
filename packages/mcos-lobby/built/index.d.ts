/**
 * Entry and exit point for the lobby service
 *
 * @export
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {Promise<import('mcos-shared/types').GServiceResponse>}
 */
export function receiveLobbyData(dataConnection: import('mcos-shared/types').BufferWithConnection): Promise<import('mcos-shared/types').GServiceResponse>;
/**
 * Please use {@link LobbyServer.getInstance()}
 * @classdesc
 */
export class LobbyServer {
    /**
     *
     *
     * @static
     * @type {LobbyServer}
     * @memberof LobbyServer
     */
    static _instance: LobbyServer;
    /**
     * Get the single instance of the lobby service
     *
     * @static
     * @return {LobbyServer}
     * @memberof LobbyServer
     */
    static getInstance(): LobbyServer;
    /**
     * @private
     * @return {NPSMessage}}
     */
    private _npsHeartbeat;
    /**
     * @param {{connection: import("mcos-shared").TCPConnection, data: Buffer}} rawPacket
     * @return {Promise<import("mcos-shared").TCPConnection>}
     */
    dataHandler(rawPacket: {
        connection: import("mcos-shared").TCPConnection;
        data: Buffer;
    }): Promise<import("mcos-shared").TCPConnection>;
    /**
     * Handle a request to connect to a game server packet
     *
     * @private
     * @param {import("mcos-shared").TCPConnection} connection
     * @param {Buffer} rawData
     * @return {Promise<NPSMessage>}
     */
    private _npsRequestGameConnectServer;
}
//# sourceMappingURL=index.d.ts.map