/// <reference types="node" />
import {
    ServerLogger,
    LegacyMessage,
    SerializedBuffer,
} from "@rustymotors/shared";
/**
 * Array of supported message handlers
 *
 * @type {{
 *  opCode: number,
 * name: string,
 * handler: (args: {
 * connectionId: string,
 * message: LegacyMessage,
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
        message: LegacyMessage;
        log: ServerLogger;
    }) => Promise<{
        connectionId: string;
        messages: SerializedBuffer[];
    }>;
}[];
/**
 * Return string as buffer
 */
export declare function generateNameBuffer(name: string, size: number): Buffer;
/**
 * All personas
 * NOTE: Currently we only support one persona per customer
 * @type {import("../../interfaces/index.js").PersonaRecord[]}
 */
export declare const personaRecords: import("../../interfaces/index.js").PersonaRecord[];
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
 * @throws {Error} Unknown code was received
 */
export declare function receivePersonaData({
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
