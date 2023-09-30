import { getServerLogger } from "../../../shared/log.js";
import {
    NPSMessage,
    SerializedBuffer,
} from "../../../shared/messageFactory.js";

/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {SerializedBuffer} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 * @returns {Promise<{
 *  connectionId: string
 * messages: SerializedBuffer[],
 * }>}
 */
export async function _npsHeartbeat({
    connectionId,
    // @ts-ignore
    message, // eslint-disable-line no-unused-vars
    log = getServerLogger({
        module: "_npsHeartbeat",
    }),
}) {
    const packetContent = Buffer.alloc(8);
    const packetResult = new NPSMessage();
    packetResult._header.id = 0x127;
    packetResult.#_data = packetContent;

    log.debug("Dumping packet...");
    log.debug(packetResult.toString());

    const outboundMessage = SerializedBuffer.fromNPSMessage(packetResult);

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
