import {
    fetchStateFromDatabase,
    findSessionByConnectionId,
} from "rusty-motors-shared";
import { OldServerMessage } from "rusty-motors-shared";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import { GenericReplyMessage } from "./GenericReplyMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./types.js";
import { getServerLogger } from "rusty-motors-shared";
import { dbRepairVehicleParts } from "../../database/src/cache.js";

const defaultLogger = getServerLogger("handlers/_repairMultipleParts");

export async function _repairMultipleParts({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const msg = new GenericRequestMessage();
    msg.deserialize(packet.data);

    log.debug(`Received Message: ${msg.toString()}`);

    const vehicleId = msg.data.readUInt32LE(0);

    const state = fetchStateFromDatabase();
    const session = findSessionByConnectionId(state, connectionId);

    if (!session) {
        throw Error("Session not found");
    }

    await dbRepairVehicleParts(vehicleId, session.gameId);

    log.debug(`Repaired all parts on vehicle ${vehicleId}`);

    const reply = new GenericReplyMessage();
    reply.msgNo = 101;
    reply.msgReply = 178;

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = packet.sequenceNumber;
    responsePacket._header.flags = 8;

    responsePacket.setBuffer(reply.serialize());

    return { connectionId, messages: [responsePacket] };
}
