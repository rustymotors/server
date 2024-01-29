import { ServerLogger, getServerLogger } from "../../shared/log.js";
import {
    LegacyMessage,
    SerializedBuffer,
} from "../../shared/messageFactory.js";

/**
 * Handle game logout
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {ServerLogger} [args.log=getServerLogger({ module: "LoginServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: SerializedBuffer[],
 * }>}
 */

export async function _gameLogout({
    connectionId,
    message,
    log = getServerLogger({
        module: "PersonaServer",
    }),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: ServerLogger;
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
    const responsePacket = new LegacyMessage();
    responsePacket._header.id = 519;
    log.debug(
        `NPSMsg response object from _npsLogoutGameUser',
      ${JSON.stringify({
          NPSMsg: responsePacket.toString(),
      })}`,
    );

    const outboundMessage = new SerializedBuffer();
    outboundMessage._doDeserialize(responsePacket._doSerialize());

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
