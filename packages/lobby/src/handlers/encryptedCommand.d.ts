import { ServerLogger, LegacyMessage, SerializedBuffer } from "../../shared";
/**
 * Array of supported command handlers
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
export type NpsCommandHandler = {
    opCode: number;
    name: string;
    handler: (args: {
        connectionId: string;
        message: LegacyMessage;
        log: ServerLogger;
    }) => Promise<{
        connectionId: string;
        message: LegacyMessage;
    }>;
};
/**
 *
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {SerializedBuffer} args.message
 * @param {ServerLogger} args.log
  * @returns {Promise<{
*  connectionId: string,
* messages: SerializedBuffer[],
* }>}

 */
export declare function handleEncryptedNPSCommand({
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
export declare const channelRecordSize = 40;
export declare const channels: {
    id: number;
    name: string;
    population: number;
}[];
