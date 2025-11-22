import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { getServerLogger } from "rusty-motors-shared";
import { GenericRequestMessage } from "./GenericRequestMessage.js";

const defaultLogger = getServerLogger("handlers/trackingPing");

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _raceKeepAlive({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    // Create new response packet
    const raceKeepAliveRequest = new GenericRequestMessage();
    raceKeepAliveRequest.deserialize(packet.serialize())

    log.verbose(`RaceKeepAlive`, {
        connectionId,
        data: JSON.stringify(raceKeepAliveRequest)
    });

    return { connectionId, messages: [] };
}
