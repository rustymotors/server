/// <reference types="node" />
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
export function compressIfNeeded(connection: any, packet: MessageNode): Promise<ConnectionWithPacket>;
/**
 *
 * @param {TCPConnection} connection
 * @param {MessageNode} packet
 * @returns {Promise<ConnectionWithPacket>}
 */
export function encryptIfNeeded(connection: any, packet: MessageNode): Promise<ConnectionWithPacket>;
/**
 *
 * @param {TCPConnection} connection
 * @param {MessageNode[]} packetList
 * @returns {Promise<TCPConnection>}
 */
export function socketWriteIfOpen(connection: any, packetList: MessageNode[]): Promise<any>;
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
    getStockCarInfo(connection: any, packet: MessageNode): Promise<ConnectionWithPackets>;
    /**
     *
     * @param {TCPConnection} connection
     * @param {MessageNode} packet
     * @returns {Promise<ConnectionWithPackets>}
     */
    clientConnect(connection: any, packet: MessageNode): Promise<ConnectionWithPackets>;
    /**
     * Route or process MCOTS commands
     * @param {MessageNode} node
     * @param {TCPConnection} conn
     * @return {Promise<TCPConnection>}
     */
    processInput(node: MessageNode, conn: any): Promise<any>;
    /**
     * @param {MessageNode} msg
     * @param {TCPConnection} con
     * @return {Promise<TCPConnection>}
     */
    messageReceived(message: any, con: any): Promise<any>;
    /**
     *
     * @param {UnprocessedPacket} rawPacket
     * @returns {Promise<TCPConnection>}
     */
    defaultHandler(rawPacket: UnprocessedPacket): Promise<any>;
}
export type ConnectionWithPacket = {
    connection: any;
    packet: MessageNode;
    lastError?: string;
};
export type ConnectionWithPackets = {
    connection: any;
    packetList: MessageNode[];
};
export type UnprocessedPacket = {
    connectionId: string;
    connection: any;
    data: Buffer;
    localPort: number | undefined;
    remoteAddress: string | undefined;
    timestamp: number;
};
import { MessageNode } from "../../message-types/src/index";
import { MCOTServer } from "./index";
import { DatabaseManager } from "../../database/src/index";
import { Buffer } from "buffer";
