/// <reference types="node" />
import { Socket } from "net";
import { Connection } from "./Connection";
/**
 * Handle a request to connect to a game server packet
 * @param {Socket} socket
 * @param {Buffer} rawData
 */
export declare function npsRequestGameConnectServer(socket: Socket, rawData: Buffer): Promise<Buffer>;
/**
 * Takes a plaintext command packet, encrypts it, and sends it across the connection's socket
 * @param {Connection} con
 * @param {Buffer} data
 */
export declare function sendCommand(con: Connection, data: Buffer): Promise<Connection>;
