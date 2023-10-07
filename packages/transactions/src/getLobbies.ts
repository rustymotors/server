import { LobbyInfo, LobbyMessage } from "./LobbyMessage.js";
import { ServerMessage } from "../../shared/messageFactory.js";
import { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */

async function _getLobbies({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    log.debug("In _getLobbies...");

    log.debug(`Received Message: ${packet.toString()}`);

    // Create new response packet
    const responsePacket = new ServerMessage();
    responsePacket._header.sequence = packet._header.sequence;
    responsePacket._header.flags = 8;

    const lobbyResponse = new LobbyMessage();
    lobbyResponse._msgNo = 325;
    lobbyResponse._shouldExpectMoreMessages = false;

    const lobby = new LobbyInfo();
    lobby._lobbyId = 1;
    lobby._lobbyName = "Lobby 1";
    lobby._topDog = "Drazi Crendraven";

    log.debug(`Logging LobbyInfo: ${lobby.serialize().toString("hex")}`);

    lobbyResponse.addLobby(lobby);

    log.debug(
        `Logging LobbyMessage: ${lobbyResponse.serialize().toString("hex")}`,
    );

    responsePacket.setBuffer(lobbyResponse.serialize());

    return { connectionId, messages: [responsePacket] };
}
/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */
export async function getLobbies({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const result = await _getLobbies({ connectionId, packet, log });
    log.debug("Dumping Lobbies response packet...");
    result.messages.forEach((msg) => {
        log.debug(msg.toString());
    });
    log.debug(result.messages.join().toString());
    return {
        connectionId,
        messages: result.messages,
    };
}
