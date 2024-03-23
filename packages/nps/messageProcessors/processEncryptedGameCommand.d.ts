import { GameMessage } from "../messageStructs/GameMessage.js";
import type { SocketCallback } from "./index.js";
export declare function processEncryptedGameCommand(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void>;
