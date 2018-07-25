/// <reference types="node" />
import { Socket } from "net";
import { Connection } from "./Connection";
import { IRawPacket } from "./listenerThread";
export default class ConnectionMgr {
    private connections;
    private newConnectionId;
    constructor();
    /**
     * Locate connection by remoteAddress and localPort in the connections array
     * @param {String} connectionId
     */
    findConnectionByAddressAndPort(remoteAddress: string, localPort: number): Connection;
    /**
     * Locate connection by id in the connections array
     * @param {String} connectionId
     */
    findConnectionById(connectionId: number): Connection;
    /**
     * Deletes the provided connection id from the connections array
     * FIXME: Doesn't actually seem to work
     * @param {String} connectionId
     */
    deleteConnection(connection: Connection): void;
    updateConnectionById(connectionId: number, newConnection: Connection): void;
    /**
     * Create new connection if when haven't seen this socket before,
     * or update the socket on the connection object if we have.
     * @param {String} id
     * @param {Socket} socket
     */
    findOrNewConnection(socket: Socket): Connection;
    /**
     * Dump all connections for debugging
     */
    dumpConnections(): Connection[];
}
/**
 * Check incoming data and route it to the correct handler based on localPort
 * @param {String} id
 * @param {Buffer} data
 */
export declare function processData(rawPacket: IRawPacket): Promise<Connection>;
