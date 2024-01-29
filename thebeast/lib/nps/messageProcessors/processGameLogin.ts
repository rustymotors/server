import { ISerializable, IMessageHeader, IMessage } from "../types.js";
import { GameMessage } from "../messageStructs/GameMessage.js";
import { SocketCallback } from "./index.js";
import { getDWord, getLenString, getNBytes } from "../utils/pureGet.js";
import {
    getUserSessionByConnectionId,
    getUserSessionByCustomerId,
    setUserSession,
} from "../services/session.js";

export async function processGameLogin(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void> {
    const customerId = getDWord(message.getDataAsBuffer(), 0, false);

    const personaId = getDWord(message.getDataAsBuffer(), 4, false);

    const shardId = getDWord(message.getDataAsBuffer(), 8, false);

    // Log the values
    console.log(`Customer ID: ${customerId}`);
    console.log(`Persona ID: ${personaId}`);
    console.log(`Shard ID: ${shardId}`);

    // This message is only called by debug, so let's sey the clinet version to debug
    const session = await getUserSessionByCustomerId(customerId);

    if (!session) {
        throw new Error(`Session not found for customer ID ${customerId}`);
    }

    if (session) {
        console.log(
            `Setting client version to debug for ${session.customerId}`,
        );

        session.clientVersion = "debug";

        console.log(
            `Setting persona ID to ${personaId} for ${session.customerId}`,
        );

        session.activeProfileId = personaId;

        setUserSession(session);
    }

    console.log(`GameLogin: ${message.toString()}`);

    const response = new GameMessage(0);
    response.header.setId(0x207);

    const responseBytes = response.serialize();

    socketCallback([responseBytes]);
}
