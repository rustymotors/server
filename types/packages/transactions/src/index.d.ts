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
     * @param {TCPConnection} connection
     * @param {MessageNode} node
     * @return {Promise<ConnectionWithPackets}>}
     */
    _login(connection: any, node: MessageNode): Promise<any>;
    /**
     *
     * @param {TCPConnection} connection
     * @param {MessageNode} node
     * @return {Promise<ConnectionWithPackets>}
     */
    _getLobbies(connection: any, node: MessageNode): Promise<any>;
    /**
     *
     * @param {TCPConnection} connection
     * @param {MessageNode} node
     * @return {Promise<import("./tcp-manager").ConnectionWithPackets>}
     */
    _logout(connection: any, node: MessageNode): Promise<import("./tcp-manager").ConnectionWithPackets>;
    /**
     *
     * @param {TCPConnection} connection
     * @param {MessageNode} node
     * @return {Promise<ConnectionWithPackets>}
     */
    _setOptions(connection: any, node: MessageNode): Promise<any>;
    /**
     *
     * @param {TCPConnection} connection
     * @param {MessageNode} node
     * @return {Promise<ConnectionWithPackets>}
     */
    _trackingMessage(connection: any, node: MessageNode): Promise<any>;
    /**
     *
     * @param {TCPConnection} connection
     * @param {MessageNode} node
     * @return {Promise<ConnectionWithPackets>}
     */
    _updatePlayerPhysical(connection: any, node: MessageNode): Promise<any>;
}
export { TCPManager };
import { MessageNode } from "../../message-types/src/index";
import { TCPManager } from "./tcp-manager";
