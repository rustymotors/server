import type { MessageHandlerArgs, MessageHandlerResult } from "../types.js";
/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export declare function login({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult>;
export declare function loginComplete({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult>;
