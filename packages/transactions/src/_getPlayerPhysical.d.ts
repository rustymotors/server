import type { MessageHandlerArgs, MessageHandlerResult } from "../types.js";
export declare function _getPlayerPhysical({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult>;
