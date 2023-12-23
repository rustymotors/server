import { getServerLogger } from "../../shared/log.js";
import {
    LegacyMessage,
    SerializedBuffer,
} from "../../shared/messageFactory.js";

/**
 * Selects a game persona and marks it as in use
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "LoginServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: SerializedBuffer[],
 * }>}
 */

export async function _selectGamePersona({
    connectionId,
    message,
    log = getServerLogger({
        module: "PersonaServer",
    }),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: import("pino").Logger;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}> {
    log.debug("_npsSelectGamePersona...");
    const requestPacket = message;
    log.debug(
        `LegacyMsg request object from _npsSelectGamePersona ${requestPacket
            ._doSerialize()
            .toString("hex")}`,
    );

    // Create the packet content
    const packetContent = Buffer.alloc(251);

    // Build the packet
    // Response Code
    // 207 = success
    const responsePacket = new LegacyMessage();
    responsePacket._header.id = 519;
    responsePacket.setBuffer(packetContent);
    log.debug(
        `LegacyMsg response object from _npsSelectGamePersona ${responsePacket
            ._doSerialize()
            .toString("hex")} `,
    );

    const outboundMessage = new SerializedBuffer();
    outboundMessage.setBuffer(responsePacket._doSerialize());

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
