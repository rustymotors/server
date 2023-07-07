/// <reference types="node" />
import { TServiceRouterArgs, TServiceResponse } from "mcos/shared/interfaces";
/**
 * Convert to zero padded hex
 *
 * @export
 * @param {Buffer} data
 * @return {string}
 */
export declare function toHex(data: Buffer): string;
/**
 * @param {string} key
 * @return {Buffer}
 */
export declare function _generateSessionKeyBuffer(key: string): Buffer;
/**
 * Handle a request to connect to a game server packet
 *
 * @private
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerLogger} log
 * @return {Promise<iTMessageArrayWithConnection>}
 */
export declare function _npsRequestGameConnectServer(args: TServiceRouterArgs): Promise<TServiceResponse>;
