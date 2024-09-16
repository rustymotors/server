import { OldServerMessage } from "../../shared/OldServerMessage.js";
import { EntryFeePurseMessage, PurseEntry } from "./EntryFeePurseMessage.js";
import { LobbyInfo, LobbyMessage } from "./LobbyMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";

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
    const lobbiesResponsePacket = new OldServerMessage();
    lobbiesResponsePacket._header.sequence = packet._header.sequence;
    lobbiesResponsePacket._header.flags = 8;

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

    lobbiesResponsePacket.setBuffer(lobbyResponse.serialize());

    // Handle purse entries
    const purseEntry = new PurseEntry();
    purseEntry._entryFee = 100;
    purseEntry._purse = 1000;

    const perseEntryResponse = new EntryFeePurseMessage();
    perseEntryResponse._msgNo = 408;
    perseEntryResponse._shouldExpectMoreMessages = false;
    perseEntryResponse.addEntry(purseEntry);

    log.debug(
        `Logging EntryFeePurseMessage: ${perseEntryResponse
            .serialize()
            .toString("hex")}`,
    );

    const perseEntriesResponsePacket = new OldServerMessage();
    perseEntriesResponsePacket._header.sequence = packet._header.sequence;
    perseEntriesResponsePacket._header.flags = 8;

    perseEntriesResponsePacket.setBuffer(perseEntryResponse.serialize());

    return {
        connectionId,
        messages: [lobbiesResponsePacket, perseEntriesResponsePacket],
    };
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
