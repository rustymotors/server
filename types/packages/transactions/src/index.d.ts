/**
 * Manages the game database server
 */
export class MCOTServer {
    /** @type {MCOTServer} */
    static _instance: MCOTServer;
    /**
     *
     * @returns {MCOTServer}
     */
    static getInstance(): MCOTServer;
    /**
     * Return the string representation of the numeric opcode
     *
     * @param {number} messageID
     * @return {string}
     */
    _MSG_STRING(messageID: number): string;
    /**
     *
     * @param {import("../../core/src/tcpConnection").TCPConnection} connection
     * @param {MessageNode} node
     * @return {Promise<import("./types").ConnectionWithPackets>}
     */
    _login(connection: import("../../core/src/tcpConnection").TCPConnection, node: MessageNode): Promise<import("./types").ConnectionWithPackets>;
    /**
     *
     * @param {import("../../core/src/tcpConnection").TCPConnection} connection
     * @param {MessageNode} node
     * @return {Promise<import("./types").ConnectionWithPackets>}
     */
    _getLobbies(connection: import("../../core/src/tcpConnection").TCPConnection, node: MessageNode): Promise<import("./types").ConnectionWithPackets>;
    /**
     *
     * @param {import("../../core/src/tcpConnection").TCPConnection} connection
     * @param {MessageNode} node
     * @return {Promise<import("./types").ConnectionWithPackets>}
     */
    _logout(connection: import("../../core/src/tcpConnection").TCPConnection, node: MessageNode): Promise<import("./types").ConnectionWithPackets>;
    /**
     *
     * @param {import("../../core/src/tcpConnection").TCPConnection} connection
     * @param {MessageNode} node
     * @return {Promise<import("./types").ConnectionWithPackets>}
     */
    _setOptions(connection: import("../../core/src/tcpConnection").TCPConnection, node: MessageNode): Promise<import("./types").ConnectionWithPackets>;
    /**
     *
     * @param {import("../../core/src/tcpConnection").TCPConnection} connection
     * @param {MessageNode} node
     * @return {Promise<import("./types").ConnectionWithPackets>}
     */
    _trackingMessage(connection: import("../../core/src/tcpConnection").TCPConnection, node: MessageNode): Promise<import("./types").ConnectionWithPackets>;
    /**
     *
     * @param {import("../../core/src/tcpConnection").TCPConnection} connection
     * @param {MessageNode} node
     * @return {Promise<import("./types").ConnectionWithPackets>}
     */
    _updatePlayerPhysical(connection: import("../../core/src/tcpConnection").TCPConnection, node: MessageNode): Promise<import("./types").ConnectionWithPackets>;
}
import { MessageNode } from "../../message-types/src/messageNode.js";
