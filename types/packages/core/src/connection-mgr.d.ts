export type NpsCommandMap = {
    name: string;
    value: number;
    module: "Lobby" | "Login";
};
export class ConnectionManager {
    /**
     * @private
     * @type {ConnectionManager} */
    private static _instance;
    /**
     *
     * @returns {ConnectionManager}
     */
    static getInstance(): ConnectionManager;
    /** @type {TCPConnection[]} */
    connections: TCPConnection[];
    /** @type {number} */
    newConnectionId: number;
    /** @type {string[]} */
    banList: string[];
    /**
     *
     * @param {string} connectionId
     * @param {import("net").Socket} socket
     * @returns {TCPConnection}
     */
    newConnection(connectionId: string, socket: import("net").Socket): TCPConnection;
    /**
     *
     * @param {string} remoteAddress
     * @param {number} localPort
     * @param {TCPConnection} newConnection
     */
    updateConnectionByAddressAndPort(remoteAddress: string, localPort: number, newConnection: TCPConnection): Promise<void>;
    clearConnectionQueue(): void;
    /** @returns {import("./tcpConnection").TCPConnection[]} */
    getConnections(): import("./tcpConnection").TCPConnection[];
    /**
     * @return {string}
     */
    handleResetAllQueueState(): string;
    /**
     * Check incoming data and route it to the correct handler based on localPort
     * @param {import("../../transactions/src/types").UnprocessedPacket} rawPacket
     * @param {import("../../login/src/index").LoginServer} loginServer
     * @param {import("../../persona/src/index").PersonaServer} personaServer
     * @param {import("../../lobby/src/index").LobbyServer} lobbyServer
     * @param {import("../../transactions/src/index").MCOTServer} mcotServer
     * @param {import("../../database/src/index").DatabaseManager} databaseManager
     * @returns {Promise<TCPConnection>}
     */
    processData(rawPacket: any, loginServer: any, personaServer: any, lobbyServer: any, mcotServer: any, databaseManager: any): Promise<TCPConnection>;
    /**
     * Get the name connected to the NPS opcode
     * @param {number} opCode
     * @return {string}
     */
    getNameFromOpCode(opCode: number): string;
    /**
     * Get the name connected to the NPS opcode
     * @param {string} name
     * @return {number}
     */
    getOpcodeFromName(name: string): number;
    /**
     *
     * @return {string[]}
     */
    getBans(): string[];
    /**
     * Locate connection by remoteAddress and localPort in the connections array
     * @param {string} remoteAddress
     * @param {number} localPort
     * @return {TCPConnection | undefined}
     */
    findConnectionByAddressAndPort(remoteAddress: string, localPort: number): TCPConnection | undefined;
    /**
     * Locate connection by id in the connections array
     * @param {string} connectionId
     * @returns {TCPConnection}
     */
    findConnectionById(connectionId: string): TCPConnection;
    /**
     *
     * @param {string} address
     * @param {number} port
     * @param {TCPConnection} newConnection
     */
    _updateConnectionByAddressAndPort(address: string, port: number, newConnection: TCPConnection): Promise<void>;
    /**
     * Return an existing connection, or a new one
     * @param {import("net").Socket} socket
     * @returns {TCPConnection}
     */
    findOrNewConnection(socket: import("net").Socket): TCPConnection;
    /**
     *
     */
    resetAllQueueState(): void;
    /**
     * Dump all connections for debugging
     * @returns {TCPConnection[]}
     */
    dumpConnections(): TCPConnection[];
    /**
     * @return {string}
     */
    handleGetConnections(): string;
}
/** @type {NpsCommandMap[]} */
export const NPS_COMMANDS: NpsCommandMap[];
/** @type {NpsCommandMap[]} */
export const NPS_LOGIN_COMMANDS: NpsCommandMap[];
import { TCPConnection } from "./tcpConnection.js";
