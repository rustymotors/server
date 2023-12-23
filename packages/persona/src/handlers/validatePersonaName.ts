import { getServerLogger } from "../../../shared/log.js";
import {
    LegacyMessage,
    SerializedBuffer,
} from "../../../shared/messageFactory.js";
import { RawMessage } from "../../../shared/src/RawMessage.js";

/**
 * Check if a new persona name is valid
 */

export async function validatePersonaName({
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
    log.debug("_npsLogoutGameUser...");
    const requestPacket = message;
    log.debug(
        `NPSMsg request object from _npsLogoutGameUser',
      ${JSON.stringify({
          NPSMsg: requestPacket.toString(),
      })}`,
    );

    // Build the packet
    const responsePacket = new RawMessage(522); // 0x020a - NPS_DUP_USER
    log.debug(
        `NPSMsg response object from _npsLogoutGameUser',
      ${JSON.stringify({
          NPSMsg: responsePacket.toString(),
      })}`,
    );

    const outboundMessage = new SerializedBuffer();
    outboundMessage._doDeserialize(responsePacket.serialize());

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
