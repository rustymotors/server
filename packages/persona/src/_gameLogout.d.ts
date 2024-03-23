import { LegacyMessage, SerializedBuffer } from "../../shared";
/**
 * Handle game logout
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {ServerLogger} args.log
 * @returns {Promise<{
 *  connectionId: string,
 * messages: SerializedBuffer[],
 * }>}
 */
export declare function _gameLogout({
    connectionId,
    message,
}: {
    connectionId: string;
    message: LegacyMessage;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}>;
