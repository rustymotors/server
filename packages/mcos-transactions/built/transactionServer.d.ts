/**
 * Manages the game database server
 * @classdesc
 */
export class MCOTServer {
    /**
     *
     *
     * @private
     * @static
     * @type {MCOTServer}
     * @memberof MCOTServer
     */
    private static _instance;
    /**
     * Get the instance of the transactions server
     * @returns {MCOTServer}
     */
    static getTransactionServer(): MCOTServer;
    /** @type {DatabaseManager} */
    databaseManager: DatabaseManager;
    /**
     * Return the string representation of the numeric opcode
     *
     * @param {number} messageID
     * @return {string}
     */
    _MSG_STRING(messageID: number): string;
    /**
     *
     * @private
     * @param {import('mcos-shared').TCPConnection} connection
     * @param {MessageNode} node
     * @return {{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}}>}
     */
    private _login;
    /**
     *
     * @private
     * @param {import('mcos-shared').TCPConnection} connection
     * @param {MessageNode} node
     * @return {{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}}
     */
    private _getLobbies;
    /**
     *
     * @private
     * @param {import('mcos-shared').TCPConnection} connection
     * @param {MessageNode} node
     * @return {{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}}
     */
    private _logout;
    /**
     *
     * @private
     * @param {import('mcos-shared').TCPConnection} connection
     * @param {MessageNode} node
     * @return {{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}}
     */
    private _setOptions;
    /**
     *
     * @private
     * @param {import('mcos-shared').TCPConnection} connection
     * @param {MessageNode} node
     * @return {{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}}
     */
    private _trackingMessage;
    /**
     *
     * @private
     * @param {import('mcos-shared').TCPConnection} connection
     * @param {MessageNode} node
     * @return {{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}}
     */
    private _updatePlayerPhysical;
    /**
     * Handles the getStockCarInfo message
     * @param {import('mcos-shared').TCPConnection} connection
     * @param {MessageNode} packet
     * @returns {{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}}
     */
    getStockCarInfo(connection: import('mcos-shared').TCPConnection, packet: MessageNode): {
        connection: import('mcos-shared').TCPConnection;
        packetList: MessageNode[];
    };
    /**
     * @param {import('mcos-shared').TCPConnection} connection
     * @param {MessageNode} packet
     * @return {Promise<{connection: import('mcos-shared').TCPConnection, packetList: MessageNode[]}>}
     */
    clientConnect(connection: import('mcos-shared').TCPConnection, packet: MessageNode): Promise<{
        connection: import('mcos-shared').TCPConnection;
        packetList: MessageNode[];
    }>;
    /**
     * Route or process MCOTS commands
     * @param {MessageNode} node
     * @param {import('mcos-shared').TCPConnection} conn
     * @return {Promise<{err: Error | null, data: import('mcos-shared').TCPConnection | null}>}
     */
    processInput(node: MessageNode, conn: import('mcos-shared').TCPConnection): Promise<{
        err: Error | null;
        data: import('mcos-shared').TCPConnection | null;
    }>;
    /**
     *
     *
     * @param {import('mcos-shared').TCPConnection} conn
     * @param {MessageNode} node
     * @return {import('mcos-shared').TCPConnection}
     * @memberof MCOTServer
     */
    handleShockCarInfoMessage(conn: import('mcos-shared').TCPConnection, node: MessageNode): import('mcos-shared').TCPConnection;
    /**
     *
     *
     * @param {import('mcos-shared').TCPConnection} conn
     * @param {MessageNode} node
     * @return {import('mcos-shared').TCPConnection}
     * @memberof MCOTServer
     */
    handleGetLobbiesMessage(conn: import('mcos-shared').TCPConnection, node: MessageNode): import('mcos-shared').TCPConnection;
    /**
     *
     *
     * @param {import('mcos-shared').TCPConnection} conn
     * @param {MessageNode} node
     * @return {import('mcos-shared').TCPConnection}
     * @memberof MCOTServer
     */
    handleLogoutMessage(conn: import('mcos-shared').TCPConnection, node: MessageNode): import('mcos-shared').TCPConnection;
    /**
     *
     *
     * @param {import('mcos-shared').TCPConnection} conn
     * @param {MessageNode} node
     * @return {import('mcos-shared').TCPConnection}
     * @memberof MCOTServer
     */
    handleLoginMessage(conn: import('mcos-shared').TCPConnection, node: MessageNode): import('mcos-shared').TCPConnection;
    /**
     *
     *
     * @param {import('mcos-shared').TCPConnection} conn
     * @param {MessageNode} node
     * @return {Promise<import('mcos-shared').TCPConnection>}
     * @memberof MCOTServer
     */
    handleClientConnect(conn: import('mcos-shared').TCPConnection, node: MessageNode): Promise<import('mcos-shared').TCPConnection>;
    /**
     *
     *
     * @param {import('mcos-shared').TCPConnection} conn
     * @param {MessageNode} node
     * @return {import('mcos-shared').TCPConnection}
     * @memberof MCOTServer
     */
    handleUpdatePlayerPhysical(conn: import('mcos-shared').TCPConnection, node: MessageNode): import('mcos-shared').TCPConnection;
    /**
     *
     *
     * @param {import('mcos-shared').TCPConnection} conn
     * @param {MessageNode} node
     * @return {import('mcos-shared').TCPConnection}
     * @memberof MCOTServer
     */
    handleTrackingMessage(conn: import('mcos-shared').TCPConnection, node: MessageNode): import('mcos-shared').TCPConnection;
    /**
     *
     *
     * @param {import('mcos-shared').TCPConnection} conn
     * @param {MessageNode} node
     * @return {import('mcos-shared').TCPConnection}
     * @memberof MCOTServer
     */
    handleSetOptions(conn: import('mcos-shared').TCPConnection, node: MessageNode): import('mcos-shared').TCPConnection;
    /**
     *
     *
     * @param {import('mcos-shared/types').MessageNode} message
     * @param {import('mcos-shared').TCPConnection} newConnection
     * @return {*}
     * @memberof MCOTServer
     */
    isEncryptedFlagSet(message: import('mcos-shared/types').MessageNode, newConnection: import('mcos-shared').TCPConnection): any;
    /**
     *
     *
     * @param {import('mcos-shared/types').MessageNode} message
     * @param {import('mcos-shared').TCPConnection} newConnection
     * @memberof MCOTServer
     */
    decryptBuffer(message: import('mcos-shared/types').MessageNode, newConnection: import('mcos-shared').TCPConnection): {
        err: Error;
        data: null;
    } | {
        err: null;
        data: Buffer;
    };
    /**
     * @param {MessageNode} message
     * @param {import('mcos-shared').TCPConnection} con
     * @return {Promise<{err: Error | null, data: null | import('mcos-shared').TCPConnection}>}
     */
    messageReceived(message: MessageNode, con: import('mcos-shared').TCPConnection): Promise<{
        err: Error | null;
        data: null | import('mcos-shared').TCPConnection;
    }>;
    /**
     *
     *
     * @param {import('mcos-shared/types').MessageNode} message
     * @param {import('mcos-shared').TCPConnection} newConnection
     * @return {{err: Error | null, data: Buffer | null}}
     * @memberof MCOTServer
     */
    tryDecryptBuffer(message: import('mcos-shared/types').MessageNode, newConnection: import('mcos-shared').TCPConnection): {
        err: Error | null;
        data: Buffer | null;
    };
    /**
     * Entry point for packets into the transactions server
     * @param {{connection: import('mcos-shared').TCPConnection, data: Buffer}} rawPacket
     * @returns {Promise<{err: Error | null, data: import('mcos-shared').TCPConnection | null}>}
     */
    defaultHandler(rawPacket: {
        connection: import('mcos-shared').TCPConnection;
        data: Buffer;
    }): Promise<{
        err: Error | null;
        data: import('mcos-shared').TCPConnection | null;
    }>;
}
/**
 * Get the instance of the transactions server
 * @returns {MCOTServer}
 */
export function getTransactionServer(): MCOTServer;
import { DatabaseManager } from "mcos-database";
import { MessageNode } from "mcos-shared/types";
//# sourceMappingURL=transactionServer.d.ts.map