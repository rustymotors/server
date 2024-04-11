import type { MessageHandlerArgs, MessageHandlerResult } from "../types.js";
export declare function _getOwnedParts({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult>;
