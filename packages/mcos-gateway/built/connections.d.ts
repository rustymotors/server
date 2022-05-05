/**
 *
 *
 * @export
 * @return {import('mcos-shared/types').SocketWithConnectionInfo[]}
 */
export function getAllConnections(): import('mcos-shared/types').SocketWithConnectionInfo[];
/**
   * Return an existing connection, or a new one
   *
   * @param {import("node:net").Socket} socket
   * @return {import('mcos-shared/types').SocketWithConnectionInfo}
   */
export function selectConnection(socket: import("node:net").Socket): import('mcos-shared/types').SocketWithConnectionInfo;
/**
   * Update the internal connection record
   *
   * @param {string} connectionId
   * @param {import("mcos-shared/types").SocketWithConnectionInfo} updatedConnection
   */
export function updateConnection(connectionId: string, updatedConnection: import("mcos-shared/types").SocketWithConnectionInfo): void;
/**
   * Update the internal connection record
   *
   * @param {string} address
   * @param {number} port
   * @param {import("mcos-shared").TCPConnection} newConnection
   * @return {*}  {TCPConnection[]} the updated connection
   */
export function updateConnectionByAddressAndPort(address: string, port: number, newConnection: import("mcos-shared").TCPConnection): any;
/**
   * Return an existing connection, or a new one
   *
   * @param {import("node:net").Socket} socket
   * @return {{ legacy: import("mcos-shared").TCPConnection, modern: import('mcos-shared/types').SocketWithConnectionInfo} | null}
   */
export function findOrNewConnection(socket: import("node:net").Socket): {
    legacy: import("mcos-shared").TCPConnection;
    modern: import('mcos-shared/types').SocketWithConnectionInfo;
} | null;
/**
 * Is this an MCOT bound packet?
 *
 * @export
 * @param {Buffer} inputBuffer
 * @return {boolean}
 */
export function isMCOT(inputBuffer: Buffer): boolean;
/**
   * Check incoming data and route it to the correct handler based on localPort
   *
   * @param {{connection: import('mcos-shared').TCPConnection, data: Buffer}} rawPacket
   * @return {Promise<{err: Error | null, data: TCPConnection | null}>}
   */
export function processData(rawPacket: {
    connection: import('mcos-shared').TCPConnection;
    data: Buffer;
}): Promise<{
    err: Error | null;
    data: TCPConnection | null;
}>;
import { TCPConnection } from "mcos-shared";
//# sourceMappingURL=connections.d.ts.map