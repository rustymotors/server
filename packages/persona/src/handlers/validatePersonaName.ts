import { getServerLogger } from "rusty-motors-shared";
import { SerializedBufferOld } from "../../../shared/SerializedBufferOld.js";
import { LegacyMessage } from "../../../shared/LegacyMessage.js";
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
    messages: SerializedBufferOld[];
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

    const outboundMessage = new SerializedBufferOld();
    outboundMessage._doDeserialize(responsePacket.serialize());

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
