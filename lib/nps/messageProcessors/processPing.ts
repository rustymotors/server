import { ISerializable, IMessageHeader, IMessage } from "../types.js";
import { GameMessage } from "../messageStructs/GameMessage.js";
import { SocketCallback } from "./index.js";
import { getLenString, getNBytes } from "../utils/pureGet.js";
import {
    getUserSessionByConnectionId,
    setUserSession,
} from "../services/session.js";

export function processPing(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): void {
    console.log(`Ping: ${message.toString()}`);

    const response = new GameMessage(0);
    response.header.setId(0x207);

    const responseBytes = response.serialize();

    socketCallback([responseBytes]);
}
