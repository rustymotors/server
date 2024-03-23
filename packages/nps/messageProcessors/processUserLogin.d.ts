import type { ISerializable } from "../types.js";
import { GameMessage } from "../messageStructs/GameMessage.js";
import type { SocketCallback } from "./index.js";
export declare function loadPrivateKey(path: string): string;
export declare function decryptSessionKey(
    encryptedSessionKey: string,
    privateKey: string,
): string;
export declare function unpackUserLoginMessage(message: ISerializable): {
    sessionKey: string;
    gameId: string;
    contextToken: string;
};
export declare function processUserLogin(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void>;
