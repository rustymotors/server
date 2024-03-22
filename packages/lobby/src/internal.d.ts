import { ServerLogger, SerializedBuffer } from "@rustymotors/shared";
/**
 * Array of supported message handlers
 *
 * @type {{
 *  opCode: number,
 * name: string,
 * handler: (args: {
 * connectionId: string,
 * message: SerializedBuffer,
 * log: ServerLogger,
 * }) => Promise<{
 * connectionId: string,
 * messages: SerializedBuffer[],
 * }>}[]}
 */
export declare const messageHandlers: {
    opCode: number;
    name: string;
    handler: (args: {
        connectionId: string;
        message: SerializedBuffer;
        log: ServerLogger;
    }) => Promise<{
        connectionId: string;
        messages: SerializedBuffer[];
    }>;
}[];
/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {SerializedBuffer} args.message
 * @param {ServerLogger} args.log
 * @returns {Promise<{
 *  connectionId: string,
 * messages: SerializedBuffer[],
 * }>}
 * @throws {Error} Unknown code was received
 */
export declare function receiveLobbyData({
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
