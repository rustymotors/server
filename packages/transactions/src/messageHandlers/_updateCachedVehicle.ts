import type { MessageHandlerArgs, MessageHandlerResult } from "../../types.js";

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function _updateCachedVehicle({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    log.debug(`Received Update Cached Vehicle packet: ${connectionId}, NOOP`);

    return { connectionId, messages: [] };
}
