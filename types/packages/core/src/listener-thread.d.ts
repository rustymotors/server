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
     * @param {import("./connection-mgr.js").ConnectionManager} connectionManager
     * @param {import("../../login/src/index").LoginServer} loginServer
     * @param {import("../../persona/src/index").PersonaServer} personaServer
     * @param {import("../../lobby/src/index").LobbyServer} lobbyServer
     * @param {import("../../transactions/src/index").MCOTServer} mcotServer
     * @param {import("../../database/src/index").DatabaseManager} databaseManager
     * @returns {Promise<void>}
     */
    _onData(data: Buffer, connection: import("./tcpConnection").TCPConnection, connectionManager: import("./connection-mgr.js").ConnectionManager, loginServer: import("../../login/src/index").LoginServer, personaServer: import("../../persona/src/index").PersonaServer, lobbyServer: import("../../lobby/src/index").LobbyServer, mcotServer: import("../../transactions/src/index").MCOTServer, databaseManager: import("../../database/src/index").DatabaseManager): Promise<void>;
    /**
     * Server listener method
     * @private
     * @param {import("net").Socket} socket
     * @param {import("./connection-mgr").ConnectionManager} connectionManager
     * @param {import("../../login/src/index").LoginServer} loginServer
     * @param {import("../../persona/src/index").PersonaServer} personaServer
     * @param {import("../../lobby/src/index").LobbyServer} lobbyServer
     * @param {import("../../transactions/src/index").MCOTServer} mcotServer
     * @param {import("../../database/src/index").DatabaseManager} databaseManager
     */
    private _listener;
    /**
     * Given a port and a connection manager object,
     * create a new TCP socket listener for that port
     * @param {number} localPort
     * @param {import("./connection-mgr").ConnectionManager} connectionManager
     * @param {import("../../login/src/index").LoginServer} loginServer
     * @param {import("../../persona/src/index").PersonaServer} personaServer
     * @param {import("../../lobby/src/index").LobbyServer} lobbyServer
     * @param {import("../../transactions/src/index").MCOTServer} mcotServer
     * @param {import("../../database/src/index").DatabaseManager} databaseManager
     * @returns {Promise<import("net").Server>}
     */
    startTCPListener(localPort: number, connectionManager: import("./connection-mgr").ConnectionManager, loginServer: import("../../login/src/index").LoginServer, personaServer: import("../../persona/src/index").PersonaServer, lobbyServer: import("../../lobby/src/index").LobbyServer, mcotServer: import("../../transactions/src/index").MCOTServer, databaseManager: import("../../database/src/index").DatabaseManager): Promise<import("net").Server>;
}
