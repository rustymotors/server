import { GameMessage } from "../messageStructs/GameMessage.js";
import type { SocketCallback } from "../messageProcessors/index.js";
export declare function processGetProfileInfo(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void>;
