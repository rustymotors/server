import { ISerializable, IMessageHeader, IMessage } from "../types.js";
import { GameMessage } from "../messageStructs/GameMessage.js";
import { SocketCallback } from "./index.js";
import { getLenString, getNBytes } from "../utils/pureGet.js";
import {
    getUserSessionByConnectionId,
    setUserSession,
} from "../services/session.js";
import { log } from "../../../packages/shared/log.js";

export async function processPing(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void> {
    log.info(`Ping: ${message.toString()}`);

    const response = new GameMessage(0);
    response.header.setId(0x207);

    const responseBytes = response.serialize();

    socketCallback([responseBytes]);
}
