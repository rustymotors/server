/// <reference types="node" />
import { SerializedBuffer } from "../../shared";
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
 * @param {import("../../../interfaces/index.js").ServiceArgs} args
 * @returns {Promise<{
 *  connectionId: string,
 * messages: SerializedBuffer[],
 * }>}
 */
export declare function _npsRequestGameConnectServer({
    connectionId,
    message,
    log,
}: import("../../../interfaces/index.js").ServiceArgs): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}>;
