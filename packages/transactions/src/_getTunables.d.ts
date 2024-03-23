import type { MessageHandlerArgs, MessageHandlerResult } from "../types.js";
/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export declare function _getTunables({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult>;
