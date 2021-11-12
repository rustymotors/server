/**
 * @exports
 * @typedef {Object} ConnectionWithPacket
 * @property {TCPConnection} connection
 * @property {MessageNode} packet
 * @property {string} [lastError]
 */
/**
 * @exports
 * @typedef {Object} ConnectionWithPackets
 * @property {TCPConnection} connection
 * @property {MessageNode[]} packetList
 */
/**
 * @exports
 * @typedef {Object} UnprocessedPacket
 * @property {string} connectionId
 * @property {TCPConnection} connection
 * @property {Buffer} data
 * @property {number | undefined} localPort
 * @property {string | undefined} remoteAddress
 * @property {number} timestamp
 */
/**
 * Manages TCP connection packet processing
 */
/**
 *
 * @param {TCPConnection} connection
 * @param {MessageNode} packet
 * @returns {Promise<ConnectionWithPacket>}
 */
export function compressIfNeeded(connection: TCPConnection, packet: MessageNode): Promise<ConnectionWithPacket>;
/**
 *
 * @param {TCPConnection} connection
 * @param {MessageNode} packet
 * @returns {Promise<ConnectionWithPacket>}
 */
export function encryptIfNeeded(connection: TCPConnection, packet: MessageNode): Promise<ConnectionWithPacket>;
/**
 *
 * @param {TCPConnection} connection
 * @param {MessageNode[]} packetList
 * @returns {Promise<TCPConnection>}
 */
export function socketWriteIfOpen(connection: TCPConnection, packetList: MessageNode[]): Promise<TCPConnection>;
export type EMessageDirection = string;
export namespace EMessageDirection {
    const RECEIVED: string;
    const SENT: string;
}
export class TCPManager {
    /** @type {TCPManager} */
    static _instance: TCPManager;
    /**
     *
     * @returns {TCPManager}
     */
    static getInstance(): TCPManager;
    /** @type {MCOTServer} */
    mcotServer: MCOTServer;
    /** @type {DatabaseManager} */
    databaseManager: DatabaseManager;
    /**
     *
     * @param {TCPConnection} connection
     * @param {MessageNode} packet
     * @returns {Promise<ConnectionWithPackets>}
     */
    getStockCarInfo(connection: TCPConnection, packet: MessageNode): Promise<ConnectionWithPackets>;
    /**
     *
     * @param {TCPConnection} connection
     * @param {MessageNode} packet
     * @returns {Promise<ConnectionWithPackets>}
     */
    clientConnect(connection: TCPConnection, packet: MessageNode): Promise<ConnectionWithPackets>;
    /**
     * Route or process MCOTS commands
     * @param {MessageNode} node
     * @param {TCPConnection} conn
     * @return {Promise<TCPConnection>}
     */
    processInput(node: MessageNode, conn: TCPConnection): Promise<TCPConnection>;
    /**
     * @param {MessageNode} msg
     * @param {TCPConnection} con
     * @return {Promise<TCPConnection>}
     */
    messageReceived(message: any, con: TCPConnection): Promise<TCPConnection>;
    /**
     *
     * @param {UnprocessedPacket} rawPacket
     * @returns {Promise<TCPConnection>}
     */
    defaultHandler(rawPacket: UnprocessedPacket): Promise<TCPConnection>;
}
export type ConnectionWithPacket = {
    connection: TCPConnection;
    packet: MessageNode;
    lastError?: string;
};
export type ConnectionWithPackets = {
    connection: TCPConnection;
    packetList: MessageNode[];
};
export type UnprocessedPacket = {
    connectionId: string;
    connection: TCPConnection;
    data: Buffer;
    localPort: number | undefined;
    remoteAddress: string | undefined;
    timestamp: number;
};
import { TCPConnection } from "../../core/src/tcpConnection";
import { MessageNode } from "../../message-types/src/index";
import { MCOTServer } from "./index";
import { DatabaseManager } from "../../database/src/index";
