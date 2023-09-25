// eslint-disable-next-line no-unused-vars
import { RawMessage } from "../../../shared/RawMessage.js";
import { NPSMessage } from "../../../shared/NPSMessage.js";
import { getServerLogger } from "../../../shared/log.js";

/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {RawMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 * @returns {Promise<{
 *  connectionId: string
 * messages: RawMessage[],
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
    packetResult.msgNo = 0x127;
    packetResult.setContent(packetContent);

    log.debug("Dumping packet...");
    log.debug(packetResult.toString());

    const outboundMessage = RawMessage.fromNPSMessage(packetResult);

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
