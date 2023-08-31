/// <reference types="node" resolution-mode="require"/>
import { ServiceArgs, ServiceResponse } from "../../../interfaces/index.js";
/**
 * Convert to zero padded hex
 *
 * @export
 * @param {Buffer} data
 * @return {string}
 */
export declare function toHex(data: Buffer): string;
/**
 * Handle a request to connect to a game server packet
 *
 * @private
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerLogger} log
 * @return {Promise<iTMessageArrayWithConnection>}
 */
export declare function _npsRequestGameConnectServer(args: ServiceArgs): Promise<ServiceResponse>;
//# sourceMappingURL=requestConnectGameServer.d.ts.map