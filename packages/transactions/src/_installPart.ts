import {
    fetchStateFromDatabase,
    findSessionByConnectionId,
} from "rusty-motors-shared";
import { OldServerMessage } from "rusty-motors-shared";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { getServerLogger } from "rusty-motors-shared";
import { dbInstallPart } from "../../database/src/cache.js";

const defaultLogger = getServerLogger("handlers/_installPart");

export async function _installPart({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const msg = new GenericRequestMessage();
    msg.deserialize(packet.data);

    log.debug(`Received Message: ${msg.toString()}`);

    const partId = msg.data.readUInt32LE(0);
    const parentPartId = msg.data2.readUInt32LE(0);
    const attachmentPoint = msg.data2.readUInt32LE(4);

    const state = fetchStateFromDatabase();
    const session = findSessionByConnectionId(state, connectionId);

    if (!session) {
        throw Error("Session not found");
    }

    await dbInstallPart(partId, parentPartId, attachmentPoint, session.gameId);

    log.debug(`Installed part ${partId} onto parent ${parentPartId} at attachment point ${attachmentPoint}`);

    const reply = new GenericReplyMessage();
    reply.msgNo = 101;
    reply.msgReply = 181;

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = packet.sequenceNumber;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(reply.serialize());

    return { connectionId, messages: [responsePacket] };
}
