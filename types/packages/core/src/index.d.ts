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
    /**
     * Start the HTTP, HTTPS and TCP connection listeners
     *    * @param {import("./connection-mgr").ConnectionManager} connectionManager
     * @param {import("../../login/src/index").LoginServer} loginServer
     * @param {import("../../persona/src/index").PersonaServer} personaServer
     * @param {import("../../lobby/src/index").LobbyServer} lobbyServer
     * @param {import("../../transactions/src/index").MCOTServer} mcotServer
     * @param {import("../../database/src/index").DatabaseManager} databaseManager
     * @returns {Promise<void>}
     */
    startServers(connectionManager: any, loginServer: import("../../login/src/index").LoginServer, personaServer: import("../../persona/src/index").PersonaServer, lobbyServer: import("../../lobby/src/index").LobbyServer, mcotServer: import("../../transactions/src/index").MCOTServer, databaseManager: import("../../database/src/index").DatabaseManager): Promise<void>;
}
