import { ServerLogger } from "@rustymotors/shared";
import { LegacyMessage, SerializedBuffer } from "@rustymotors/shared";
/**
 * Selects a game persona and marks it as in use
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {ServerLogger} args.log
 * @returns {Promise<{
 *  connectionId: string,
 * messages: SerializedBuffer[],
 * }>}
 */
export declare function _selectGamePersona({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: LegacyMessage;
    log: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}>;
