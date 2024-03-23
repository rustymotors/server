/// <reference types="node" />
import { ServerLogger, SerializedBuffer } from "../../shared";
/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {SerializedBuffer} args.message
 * @param {ServerLogger} args.log
 * @returns {Promise<{
 *     connectionId: string,
 *    messages: SerializedBuffer[]
 * }>}
 */
export declare function receiveTransactionsData({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: SerializedBuffer;
    log: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}>;
/**
 * @param {Buffer} buffer
 * @param {Buffer} buffer2
 */
export declare function verifyLength(buffer: Buffer, buffer2: Buffer): void;
