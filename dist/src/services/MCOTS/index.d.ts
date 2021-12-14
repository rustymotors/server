import { TCPConnection } from '../MCServer/tcpConnection';
import { MessageNode } from './message-node';
import { ConnectionWithPackets } from './tcp-manager';
/**
 * Mangages the game database server
 * @module MCOTSServer
 */
/**
 * @class
 * @property {module:MCO_Logger.logger} logger
 */
export declare class MCOTServer {
    /**
     * Return the string representation of the numeric opcode
     *
     * @param {number} msgID
     * @return {string}
     */
    _MSG_STRING(messageID: number): string;
    /**
     *
     * @param {ConnectionObj} connection
     * @param {MessageNode} node
     * @return {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
     */
    _login(connection: TCPConnection, node: MessageNode): Promise<ConnectionWithPackets>;
    /**
     *
     * @param {ConnectionObj} connection
     * @param {MessageNode} node
     * @return {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
     */
    _getLobbies(connection: TCPConnection, node: MessageNode): Promise<ConnectionWithPackets>;
    /**
     *
     * @param {module:ConnectionObj} connection
     * @param {module:MessageNode} node
     * @return {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
     */
    _logout(connection: TCPConnection, node: MessageNode): Promise<ConnectionWithPackets>;
    /**
     *
     * @param {ConnectionObj} connection
     * @param {MessageNode} node
     * @return {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
     */
    _setOptions(connection: TCPConnection, node: MessageNode): Promise<ConnectionWithPackets>;
    /**
     *
     * @param {ConnectionObj} connection
     * @param {MessageNode} node
     * @return {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
     */
    _trackingMessage(connection: TCPConnection, node: MessageNode): Promise<ConnectionWithPackets>;
    /**
     *
     * @param {module:ConnectionObj} connection
     * @param {module:MessageNode} node
     * @return {Promise<{con: ConnectionObj, nodes: MessageNode[]}>}
     */
    _updatePlayerPhysical(connection: TCPConnection, node: MessageNode): Promise<ConnectionWithPackets>;
}
