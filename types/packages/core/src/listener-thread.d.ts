/// <reference types="node" />
import { Server, Socket } from "net";
import { ITCPConnection, IConnectionManager, IListenerThread } from "../../types/src/index";
export declare class ListenerThread implements IListenerThread {
    static _instance: IListenerThread;
    static getInstance(): IListenerThread;
    private constructor();
    /**
     * The onData handler
     * takes the data buffer and creates a IRawPacket object
     */
    _onData(data: Buffer, connection: ITCPConnection): Promise<void>;
    /**
     * Server listener method
     *
     * @param {Socket} socket
     * @param {ConnectionMgr} connectionMgr
     * @return {void}
     */
    _listener(socket: Socket, connectionMgr: IConnectionManager): void;
    /**
     * Given a port and a connection manager object,
     * create a new TCP socket listener for that port
     *
     */
    startTCPListener(localPort: number, connectionMgr: IConnectionManager): Promise<Server>;
}
