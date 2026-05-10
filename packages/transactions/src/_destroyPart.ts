import {
    fetchStateFromDatabase,
    findSessionByConnectionId,
} from "rusty-motors-shared";
import { GenericRequestMessage } from "./GenericRequestMessage.js";
import type { MessageHandlerArgs, MessageHandlerResult } from "./handlers.js";
import { getServerLogger } from "rusty-motors-shared";
import { dbDestroyPart } from "../../database/src/cache.js";

const defaultLogger = getServerLogger("handlers/_destroyPart");

export async function _destroyPart({
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

    await dbDestroyPart(partId, session.gameId);

    log.debug(`Destroyed part ${partId}`);

    return { connectionId, messages: [] };
}
