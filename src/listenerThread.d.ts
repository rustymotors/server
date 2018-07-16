/// <reference types="node" />
import { Connection } from "./Connection";
import ConnectionMgr from "./connectionMgr";
export interface IRawPacket {
    timestamp: number;
    remoteAddress: string;
    localPort: number;
    connection: Connection;
    data: Buffer;
}
/**
 * Given a port and a connection manager object, create a new TCP socket listener for that port
 * @param {Int} localPort
 * @param {connectionMgr} connectionMgr
 */
export default function startTCPListener(localPort: number, connectionMgr: ConnectionMgr): Promise<void>;
