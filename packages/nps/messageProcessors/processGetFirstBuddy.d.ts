import { GameMessage } from "../messageStructs/GameMessage.js";
import type { SocketCallback } from "./index.js";
export declare function processFirstBuddy(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void>;
