/// <reference types="node" />
import { IConnectionManager, IDatabaseManager, ITCPConnection, UnprocessedPacket } from "../../types/src/index";
import { Socket } from "net";
export declare class ConnectionManager implements IConnectionManager {
    static _instance: IConnectionManager;
    databaseMgr: IDatabaseManager;
    connections: ITCPConnection[];
    newConnectionId: number;
    banList: string[];
    static getInstance(): IConnectionManager;
    private constructor();
    newConnection(connectionId: string, socket: Socket): ITCPConnection;
    /**
     * Check incoming data and route it to the correct handler based on localPort
     */
    processData(rawPacket: UnprocessedPacket): Promise<ITCPConnection>;
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
    findConnectionByAddressAndPort(remoteAddress: string, localPort: number): ITCPConnection | undefined;
    /**
     * Locate connection by id in the connections array
     */
    findConnectionById(connectionId: string): ITCPConnection;
    _updateConnectionByAddressAndPort(address: string, port: number, newConnection: ITCPConnection): Promise<void>;
    /**
     * Return an existing connection, or a new one
     */
    findOrNewConnection(socket: Socket): ITCPConnection;
    /**
     *
     * @return {void}
     */
    resetAllQueueState(): void;
    /**
     * Dump all connections for debugging
     */
    dumpConnections(): ITCPConnection[];
}
