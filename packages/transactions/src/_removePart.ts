import {
    fetchStateFromDatabase,
    findSessionByConnectionId,
} from "rusty-motors-shared";
import { OldServerMessage } from "rusty-motors-shared";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { getServerLogger } from "rusty-motors-shared";
import { dbRemovePart } from "../../database/src/cache.js";

const defaultLogger = getServerLogger("handlers/_removePart");

export async function _removePart({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const msg = new GenericRequestMessage();
    msg.deserialize(packet.data);

    log.debug(`Received Message: ${msg.toString()}`);

    const partId = msg.data.readUInt32LE(0);

    const state = fetchStateFromDatabase();
    const session = findSessionByConnectionId(state, connectionId);

    if (!session) {
        throw Error("Session not found");
    }

    await dbRemovePart(partId, session.gameId);

    log.debug(`Removed part ${partId} to inventory`);

    const reply = new GenericReplyMessage();
    reply.msgNo = 101;
    reply.msgReply = 182;

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = packet.sequenceNumber;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(reply.serialize());

    return { connectionId, messages: [responsePacket] };
}
