import type { MessageHandlerArgs, MessageHandlerResult } from "../types.js";
/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export declare function getLobbies({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult>;
