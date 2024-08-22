import {
    fetchStateFromDatabase,
    findSessionByConnectionId,
} from "../../shared/State.js";
import { ServerError } from "../../shared/errors/ServerError.js";
import { OldServerMessage } from "../../shared/OldServerMessage.js";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { PartsAssemblyMessage } from "./PartsAssemblyMessage.js";
import { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";

export async function _getOwnedParts({
    connectionId,
    packet,
    log,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const getOwnedPartsMessage = new GenericRequestMessage();
    getOwnedPartsMessage.deserialize(packet.data);

    log.debug(`Received Message: ${getOwnedPartsMessage.toString()}`);

    const state = fetchStateFromDatabase();

    const session = findSessionByConnectionId(state, connectionId);

    if (!session) {
        throw new ServerError("Session not found");
    }

    const ownedPartsMessage = new PartsAssemblyMessage(session.gameId);
    ownedPartsMessage._msgNo = 175;

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = packet._header.sequence;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(ownedPartsMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}
