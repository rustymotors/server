/// <reference types="node" />
import { Server, Socket } from 'net';
import { ConnectionManager } from './connection-mgr';
import { TCPConnection } from './tcpConnection';
/**
 * TCP Listener thread
 * @module ListenerThread
 */
/**
 * @class
 */
export declare class ListenerThread {
    /**
     * The onData handler
     * takes the data buffer and creates a IRawPacket object
     *
     * @param {Buffer} data
     * @param {ConnectionObj} connection
     * @return {Promise<void>}
     */
    _onData(data: Buffer, connection: TCPConnection): Promise<void>;
    /**
     * Server listener method
     *
     * @param {Socket} socket
     * @param {ConnectionMgr} connectionMgr
     * @return {void}
     */
    _listener(socket: Socket, connectionMgr: ConnectionManager): void;
    /**
     * Given a port and a connection manager object,
     * create a new TCP socket listener for that port
     *
     */
    startTCPListener(localPort: number, connectionMgr: ConnectionManager): Promise<Server>;
}
