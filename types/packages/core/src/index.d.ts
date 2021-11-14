/**
 * This class starts all the servers
 */
export class MCServer {
    /** @type {MCServer} */
    static _instance: MCServer;
    /** @return {Promise<MCServer>} */
    static getInstance(): Promise<MCServer>;
    /** @type {import("../../config/src/index").AppConfiguration} */
    config: import("../../config/src/index").AppConfiguration;
    /**
     * @private
     * @type {ConnectionManager | undefined}
     */
    private mgr;
    clearConnectionQueue(): void;
    /** @returns {import("./tcpConnection").TCPConnection[]} */
    getConnections(): import("./tcpConnection").TCPConnection[];
    /**
     * Start the HTTP, HTTPS and TCP connection listeners
     * @returns {Promise<void>}
     */
    startServers(): Promise<void>;
}
