import type { SocketCallback } from "./index.js";
import { GameMessage } from "../messageStructs/GameMessage.js";
export declare function loadPrivateKey(path: string): string;
export declare function decryptSessionKey(
    encryptedSessionKey: string,
    privateKey: string,
): string;
export declare function unpackUserLoginMessage(message: GameMessage): {
    sessionKey: string;
    gameId: string;
    contextToken: string;
};
export declare function processDeleteProfile(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void>;
