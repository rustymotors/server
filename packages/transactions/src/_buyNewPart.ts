import {
    fetchStateFromDatabase,
    findSessionByConnectionId,
} from "rusty-motors-shared";
import { OldServerMessage } from "rusty-motors-shared";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { getServerLogger } from "rusty-motors-shared";
import { dbBuyNewPart } from "../../database/src/cache.js";
import { GenericReplyMessage } from "./GenericReplyMessage.js";

const defaultLogger = getServerLogger("handlers/_buyNewPart");

export async function _buyNewPart({
    connectionId,
    packet,
    log = defaultLogger,
}: MessageHandlerArgs): Promise<MessageHandlerResult> {
    const buyNewPartMessage = new GenericRequestMessage();
    buyNewPartMessage.deserialize(packet.data);

    log.debug(`Received Message: ${buyNewPartMessage.toString()}`);

    const requestedPart = buyNewPartMessage.data.readInt32LE()
    const fromDealerId = buyNewPartMessage.data2.readInt32LE()

    const state = fetchStateFromDatabase();

    const session = findSessionByConnectionId(state, connectionId);

    if (!session) {
        throw Error("Session not found");
    }

    const newPartId = await dbBuyNewPart(session.gameId, requestedPart, fromDealerId, true)

    if (typeof newPartId === "undefined") {
        throw new Error(`empty part number from dbBuyNewPart`)
    }

    const newPartMessage = new GenericReplyMessage()
    newPartMessage.msgNo = 101;
    newPartMessage.result.writeInt32LE(newPartId)

    const responsePacket = new OldServerMessage();
    responsePacket._header.sequence = packet.sequenceNumber;
    responsePacket._header.flags = 8;

    log.debug(newPartMessage.toString())

    responsePacket.setBuffer(newPartMessage.serialize());

    return { connectionId, messages: [responsePacket] };
}
