export class ListenerThread {
    /** @type {ListenerThread} */
    static _instance: ListenerThread;
    /**
     *
     * @returns {ListenerThread}
     */
    static getInstance(): ListenerThread;
    /**
     * The onData handler
     * takes the data buffer and creates a IRawPacket object
     * @param {Buffer} data
     * @param {import("./tcpConnection").TCPConnection} connection
     * @returns {Promise<void>}
     */
    _onData(data: Buffer, connection: import("./tcpConnection").TCPConnection): Promise<void>;
    /**
     * Server listener method
     * @private
     * @param {import("net").Socket} socket
     * @param {import("./connection-mgr").ConnectionManager} connectionMgr
     */
    private _listener;
    /**
     * Given a port and a connection manager object,
     * create a new TCP socket listener for that port
     * @param {number} localPort
     * @param {import("./connection-mgr").ConnectionManager} connectionMgr
     * @returns {Promise<import("net").Server>}
     */
    startTCPListener(localPort: number, connectionMgr: import("./connection-mgr").ConnectionManager): Promise<import("net").Server>;
}
