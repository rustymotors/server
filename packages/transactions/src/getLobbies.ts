import { MessageNode, OldServerMessage } from 'rusty-motors-shared';
import { EntryFeePurseMessage, PurseEntry } from './EntryFeePurseMessage.js';
import { LobbyInfo, LobbyMessage } from './LobbyMessage.js';
import type { MessageHandlerArgs, MessageHandlerResult } from './handlers.js';
import { getServerLogger } from 'rusty-motors-shared';

/**
 * @param {MessageHandlerArgs} args
 * @return {Promise<MessageHandlerResult>}
 */

async function _getLobbies({
    connectionId,
    packet,
    log = getServerLogger('handlers/getLobbies'),
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    log.debug(
        `[${connectionId}] Received getLobbies packet ${packet.toString()}`,
    );

    log.debug(`[${connectionId}] Sending lobbies response...`);

    // Create new response packet
    const lobbiesResponsePacket = new MessageNode();
    lobbiesResponsePacket.sequence = packet.sequenceNumber;
    lobbiesResponsePacket.setPayloadEncryption(true);

    const lobbyResponse = new LobbyMessage();
    lobbyResponse._msgNo = 325;
    lobbyResponse._shouldExpectMoreMessages = false;

    const lobby = new LobbyInfo();
    lobby._lobbyId = 2;
    lobby._lobbyName = 'MCC10';
    lobby._raceTypeId = 14; // TESTDRIVE
    lobby._elementId = 25; // TrackId
    lobby._turfName = 'Hillvally Punks';
    lobby._topDog = 'Drazi Crendraven';
    lobby._maxNumberPlayers = 8;
    lobby._defaultNight = 1;

    log.debug(`[${connectionId}] Sending lobby: ${lobby.toString()}`);

    lobbyResponse.addLobby(lobby);

    const lobby1 = new LobbyInfo();
    lobby1._lobbyId = 10001;
    lobby1._lobbyName = 'MC100';
    lobby1._raceTypeId = 17; // TESTDRIVE
    lobby1._elementId = 25; // TrackId
    lobby1._turfName = 'Hillvally Zoom';
    lobby1._topDog = 'Drazi Crendraven';
    lobby1._maxNumberPlayers = 8;
    lobby1._defaultNight = 1;

    log.debug(`[${connectionId}] Sending lobby: ${lobby1.toString()}`);

    lobbyResponse.addLobby(lobby1);

    log.debug(
        `[${connectionId}] Sending lobbyResponse: ${lobbyResponse.toString()}`,
    );

    lobbiesResponsePacket.getBody().deserialize(lobbyResponse.serialize());

    // Handle purse entries
    const purseEntry = new PurseEntry();
    purseEntry._entryFee = 100;
    purseEntry._purse = 1000;

    const purseEntryResponse = new EntryFeePurseMessage();
    purseEntryResponse._msgNo = 408;
    purseEntryResponse._shouldExpectMoreMessages = false;
    purseEntryResponse.addEntry(purseEntry);

    log.debug(
        `[${connectionId}] Sending purseEntryResponse: ${purseEntryResponse.toString()}`,
    );

    const perseEntriesResponsePacket = new OldServerMessage();
    perseEntriesResponsePacket._header.sequence = packet.sequenceNumber;
    perseEntriesResponsePacket._header.flags = 8;

    perseEntriesResponsePacket.setBuffer(purseEntryResponse.serialize());

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
    log = getServerLogger("handlers/getLobbies"),
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const result = await _getLobbies({ connectionId, packet, log });
    log.debug('Dumping Lobbies response packet...');
    result.messages.forEach((msg) => {
        log.debug(msg.toString());
    });
    log.debug(result.messages.join().toString());
    return {
        connectionId,
        messages: result.messages,
    };
}
