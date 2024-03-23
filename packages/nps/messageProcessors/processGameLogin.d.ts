import { GameMessage } from "../messageStructs/GameMessage.js";
import type { SocketCallback } from "./index.js";
export declare function processGameLogin(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void>;
