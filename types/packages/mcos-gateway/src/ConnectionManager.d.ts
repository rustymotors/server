import { Connection } from "mcos/shared";
import { IConnection, IConnectionManager, ISocket, TEncryptionSession, TServerLogger, TSocketWithConnectionInfo } from "mcos/shared/interfaces";
export declare const connectionList: TSocketWithConnectionInfo[];
/**
 * Find a connection by id
 * @deprecated use {@link ConnectionManager.getAllConnections()} instead
 */
export declare function getAllConnections(): TSocketWithConnectionInfo[];
/**
 * Update the internal connection record
 *
 * @deprecated use one of the methods in {@link ConnectionManager} instead
 * @see {@link ConnectionManager.updateConnectionEncryption()} to update encryption session
 * @see {@link ConnectionManager.updateConnectionSocket()} to update socket
 * @see {@link ConnectionManager.updateConnectionStatus()} to update status
 */
export declare function updateConnection(connectionId: string, updatedConnection: TSocketWithConnectionInfo, log: TServerLogger): void;
/**
 * Locate connection by remoteAddress and localPort in the connections array
 * @deprecated use {@link ConnectionManager.findConnectionByAddressAndPort()} instead
 */
export declare function findConnectionByAddressAndPort(remoteAddress: string, localPort: number): TSocketWithConnectionInfo | undefined;
/**
 * Creates a new connection object for the socket and adds to list
 * @deprecated use {@link ConnectionManager.newConnectionFromSocket()} instead
 */
export declare function createNewConnection(connectionId: string, socket: ISocket, log: TServerLogger): TSocketWithConnectionInfo;
/**
 * Add a connection to the list
 * @deprecated use {@link ConnectionManager.addConnection()} instead
 */
export declare function addConnection(connection: TSocketWithConnectionInfo): void;
export declare function emptyConnectionList(): void;
/**
 * Class to manage connections
 */
export declare class ConnectionManager implements IConnectionManager {
    emptyLegacyConnectionList(): void;
    connections: IConnection[];
    static instance: ConnectionManager;
    /**
     * Find a connection by id
     * @param {string} connectionId
     * @return {Connection}
     * @throws {ServerError} if connection is not found
     */
    findConnectionByID(connectionId: string): IConnection | undefined;
    /**
     * Find a connection by socket. Returns undefined if not found
     * @param {Socket} socket
     * @return {Connection | undefined}
     */
    findConnectionBySocket(socket: ISocket): IConnection | undefined;
    findConnectionByAddressAndPort(remoteAddress: string, localPort: number): IConnection | undefined;
    /**
     * Find all connections with a given remoteAddress
     */
    findConnectionsByAddress(remoteAddress: string): IConnection[];
    emptyConnectionList(): void;
    /**
     * Add a connection to the list if it does not already exist
     * @param {Connection} connection
     * @return {void}
     */
    addConnection(connection: IConnection): void;
    /**
     * Remove a connection from the list by id if it exists
     * @param {string} connectionId
     * @return {void}
     */
    removeConnection(connectionId: string): void;
    /**
     * Remove a connection from the list by socket if it exists
     * @param {Socket} socket
     * @return {void}
     */
    removeConnectionBySocket(socket: ISocket): void;
    /**
     * Remove all connections with a given appID
     * @param {number} appID
     * @return {void}
     */
    removeConnectionsByAppID(appID: number): void;
    /**
     * Get all connections
     * @return {IConnection[]}
     */
    getAllConnections(): IConnection[];
    /**
     * Format connections as HTML
     * @param {Connection[]} connections
     * @return {string}
     */
    formatConnectionsAsHTML(connections: IConnection[]): string;
    /**
     * Format connections as JSON
     * @param {Connection[]} connections
     * @return {string}
     */
    formatConnectionsAsJSON(connections: Connection[]): string;
    /**
     * Get list of connections in queue
     * @return {Connection[]}
     */
    getQueue(): Connection[];
    /**
     * Create a new connection from a socket
     * @param {Socket} socket
     * @return {Connection}
     * @throws {ServerError} if socket is missing localPort or remoteAddress
     */
    newConnectionFromSocket(socket: ISocket): IConnection;
    /**
     * Find a connection by id and update its status
     * @param {string} connectionId
     * @param {number} status
     * @return {void}
     * @throws {ServerError} if connection is not found
     */
    updateConnectionStatus(connectionId: string, status: number): void;
    /**
     * Find a connection by id and update its socket
     * @param {string} connectionId
     * @param {Socket} socket
     * @return {void}
     * @throws {ServerError} if connection is not found
     */
    updateConnectionSocket(connectionId: string, socket: ISocket): void;
    updateConnectionEncryption(connectionId: string, encryptionSession: TEncryptionSession, useEncryption: boolean): void;
}
/**
 * Get an instance of ConnectionManager
 * @return {ConnectionManager}
 * @static
 * @memberof ConnectionManager
 */
export declare function getConnectionManager(): ConnectionManager;
