/// <reference types="node" />
import { Socket } from 'net';
import { IRawPacket } from '../../types';
import { DatabaseManager } from '../shared/database-manager';
import { TCPConnection } from './tcpConnection';
export declare class ConnectionManager {
    static _instance: ConnectionManager;
    databaseMgr: DatabaseManager;
    connections: TCPConnection[];
    newConnectionId: number;
    banList: string[];
    serviceName: string;
    static getInstance(): ConnectionManager;
    private constructor();
    newConnection(connectionId: string, socket: Socket): TCPConnection;
    /**
     * Check incoming data and route it to the correct handler based on localPort
     * @param {IRawPacket} rawPacket
     * @return {Promise} {@link module:ConnectionObj~ConnectionObj}
     */
    processData(rawPacket: IRawPacket): Promise<TCPConnection>;
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
     * @memberof ConnectionMgr
     * @return {module:ConnectionObj}
     */
    findConnectionByAddressAndPort(remoteAddress: string, localPort: number): TCPConnection | undefined;
    /**
     * Locate connection by id in the connections array
     * @param {string} connectionId
     * @return {module:ConnectionObj}
     */
    findConnectionById(connectionId: string): TCPConnection;
    /**
     *
     * @param {string} address
     * @param {number} port
     * @param {module:ConnectionObj} newConnection
     * @return {Promise<void>}
     */
    _updateConnectionByAddressAndPort(address: string, port: number, newConnection: TCPConnection): Promise<void>;
    /**
     * Return an existing connection, or a new one
     *
     * @param {module:net.Socket} socket
     * @return {module:ConnectionObj}
     */
    findOrNewConnection(socket: Socket): TCPConnection;
    /**
     *
     * @return {void}
     */
    resetAllQueueState(): void;
    /**
     * Dump all connections for debugging
     *
     * @return {module:ConnectionObj[]}
     */
    dumpConnections(): TCPConnection[];
}
