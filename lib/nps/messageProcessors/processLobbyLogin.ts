import { ISerializable, IMessageHeader, IMessage } from "../types.js";
import { SocketCallback } from "./index.js";
import { getDWord, getLenString, getNBytes } from "../utils/pureGet.js";
import {
    getUserSessionByConnectionId,
    getUserSessionByCustomerId,
    getUserSessionByProfileId,
    setUserSession,
    userSessions,
} from "../services/session.js";
import { GameMessage } from "../messageStructs/GameMessage.js";

export function processLobbyLogin(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): void {
    // This message is a BareMessageV0

    const profileId = getDWord(message.getDataAsBuffer(), 0, false);

    const session = getUserSessionByProfileId(profileId);

    // Dump all sessions
    console.dir(userSessions);

    // If the session doesn't exist, return
    if (!session) {
        throw new Error(`Session not found for profile ID ${profileId}`);
    }

    // Create the new session
    const newSession = {
        ...session,
        connectionId,
    };

    // Set the new session
    setUserSession(newSession);

    console.log(`LobbyLogin: ${message.toString()}`);

    const response = new GameMessage(0);
    response.header.setId(0x120);

    const responseBytes = response.serialize();

    socketCallback([responseBytes]);
}
