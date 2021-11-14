/**
 * Manages TCP connection packet processing
 */
/**
 *
 * @param {import("../../core/src/tcpConnection").TCPConnection} connection
 * @param {MessageNode} packet
 * @returns {Promise<import("./types").ConnectionWithPacket>}
 */
export function compressIfNeeded(connection: import("../../core/src/tcpConnection").TCPConnection, packet: MessageNode): Promise<import("./types").ConnectionWithPacket>;
/**
 *
 * @param {import("../../core/src/tcpConnection").TCPConnection} connection
 * @param {MessageNode} packet
 * @returns {Promise<import("./types").ConnectionWithPacket>}
 */
export function encryptIfNeeded(connection: import("../../core/src/tcpConnection").TCPConnection, packet: MessageNode): Promise<import("./types").ConnectionWithPacket>;
export class TCPManager {
    /** @type {TCPManager} */
    static _instance: TCPManager;
    /**
     *
     * @returns {Promise<TCPManager>}
     */
    static getInstance(): Promise<TCPManager>;
    /**
     *
     * @param {import("../../core/src/tcpConnection").TCPConnection} connection
     * @param {MessageNode} packet
     * @returns {Promise<import("./types").ConnectionWithPackets>}
     */
    getStockCarInfo(connection: import("../../core/src/tcpConnection").TCPConnection, packet: MessageNode): Promise<import("./types").ConnectionWithPackets>;
    /**
     *
     * @param {import("../../core/src/tcpConnection").TCPConnection} connection
     * @param {MessageNode} packet
     * @param {import("../../database/src/index").DatabaseManager} databaseManager
     * @returns {Promise<import("./types").ConnectionWithPackets>}
     */
    clientConnect(connection: import("../../core/src/tcpConnection").TCPConnection, packet: MessageNode, databaseManager: import("../../database/src/index").DatabaseManager): Promise<import("./types").ConnectionWithPackets>;
    /**
     * Route or process MCOTS commands
     * @param {MessageNode} node
     * @param {import("../../core/src/tcpConnection").TCPConnection} conn
     * @param {import("../../transactions/src/index").MCOTServer} mcotServer
     * @param {import("../../database/src/index").DatabaseManager} databaseManager
     * @return {Promise<import("../../core/src/tcpConnection").TCPConnection>}
     */
    processInput(node: MessageNode, conn: import("../../core/src/tcpConnection").TCPConnection, mcotServer: import("../../transactions/src/index").MCOTServer, databaseManager: import("../../database/src/index").DatabaseManager): Promise<import("../../core/src/tcpConnection").TCPConnection>;
    /**
     * @param {MessageNode} message
     * @param {import("../../core/src/tcpConnection").TCPConnection} con
     * @param {import("../../transactions/src/index").MCOTServer} mcotServer
     * @param {import("../../database/src/index").DatabaseManager} databaseManager
     * @return {Promise<import("../../core/src/tcpConnection").TCPConnection>}
     */
    messageReceived(message: MessageNode, con: import("../../core/src/tcpConnection").TCPConnection, mcotServer: import("../../transactions/src/index").MCOTServer, databaseManager: import("../../database/src/index").DatabaseManager): Promise<import("../../core/src/tcpConnection").TCPConnection>;
    /**
     *
     * @param {import("./types").UnprocessedPacket} rawPacket
     * @param {import("../../transactions/src/index").MCOTServer} mcotServer
     * @param {import("../../database/src/index").DatabaseManager} databaseManager
     * @returns {Promise<import("../../core/src/tcpConnection").TCPConnection>}
     */
    defaultHandler(rawPacket: import("./types").UnprocessedPacket, mcotServer: import("../../transactions/src/index").MCOTServer, databaseManager: import("../../database/src/index").DatabaseManager): Promise<import("../../core/src/tcpConnection").TCPConnection>;
}
import { MessageNode } from "../../message-types/src/messageNode.js";
