import { getServerLogger, type ServerLogger } from "rusty-motors-shared";
import { SerializedBufferOld } from "../../../shared/src/SerializedBufferOld.js";
import { LegacyMessage } from "../../../shared/src/LegacyMessage.js";
import { RawMessage } from "../../../shared/src/RawMessage.js";

/**
 * Check if a new persona name is valid
 */

export async function validatePersonaName({
    connectionId,
    message,
    log = getServerLogger({
        name: "PersonaServer",
    }),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBufferOld[];
}> {
    log.debug("validatePersonaName called");
    const requestPacket = message;
    log.debug(
        `NPSMsg request object from validatePersonaName ${requestPacket.toString()}`,
    );

    enum responseCodes {
        NPS_DUP_USER = 0x20a,
        NPS_USER_VALID = 0x601,
    }

    // Build the packet
    const responsePacket = new RawMessage(responseCodes.NPS_DUP_USER);
    log.debug(
        `NPSMsg response object from validatePersonaName
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
