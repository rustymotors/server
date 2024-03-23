import type { SocketCallback } from "./index.js";
import { GameMessage } from "../messageStructs/GameMessage.js";
export declare function processLobbyLogin(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void>;
