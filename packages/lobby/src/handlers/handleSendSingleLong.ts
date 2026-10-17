import { BytableMessage } from "@rustymotors/binary";
import {
    getConnectionIdByUserId,
    getServerLogger,
    getSocketQueue,
    type ServerLogger,
} from "rusty-motors-shared";
import { NpsRelaySingleMessage, rewriteSingleEnvelope } from "./NpsRelaySingleMessage.js";

const defaultLogger = getServerLogger("lobby.handleSendSingleLong");

/**
 * Handle NPS_SEND_SINGLE_LONG (opcode 0x95 / 149).
 *
 * Delivers the relay blob to one specific user (filterUserId). The 16-byte
 * SEND envelope is rewritten to the 12-byte RECEIVE envelope npslib expects
 * before forwarding — skipping this causes FIRST_CONTACT to be silently
 * dropped on the recipient.
 */
export async function handleSendSingleLong({
    connectionId,
    message,
    log = defaultLogger,
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableMessage[];
}> {
    const frame = message.serialize();
    let relay: NpsRelaySingleMessage;
    try {
        relay = NpsRelaySingleMessage.deserialize(frame);
    } catch (err) {
        log.warn(`NPS_SEND_SINGLE_LONG: bad envelope`, { connectionId, err, body: frame.toString('hex') });
        return { connectionId, messages: [] };
    }

    log.debug(`NPS_SEND_SINGLE_LONG`, {
        connectionId,
        commId: relay.commId,
        senderUserId: relay.senderUserId,
        filterUserId: relay.filterUserId,
        appType: relay.applicationPacketType,
    });

    const targetId = getConnectionIdByUserId(relay.filterUserId);
    if (targetId && targetId !== connectionId) {
        try {
            const delivery = rewriteSingleEnvelope(frame);
            getSocketQueue(targetId, 'send').put({ sequenceNo: -1, data: delivery });
        } catch {
            // Target queue gone; drop silently.
        }
    }

    return { connectionId, messages: [] };
}
