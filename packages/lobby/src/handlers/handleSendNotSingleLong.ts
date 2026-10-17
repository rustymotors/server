import { BytableMessage } from "@rustymotors/binary";
import {
    getChannelMembers,
    getConnectionIdByUserId,
    getServerLogger,
    getSocketQueue,
    type ServerLogger,
} from "rusty-motors-shared";
import { NpsRelaySingleMessage, rewriteSingleEnvelope } from "./NpsRelaySingleMessage.js";

const defaultLogger = getServerLogger("lobby.handleSendNotSingleLong");

/**
 * Handle NPS_SEND_NOT_SINGLE_LONG (opcode 0x97 / 151).
 *
 * Delivers the relay blob to every channel member EXCEPT filterUserId
 * (typically the sender). Used for position updates, score sync, and
 * end-of-race stats during a live race.
 *
 * The 16-byte SEND envelope is rewritten to the 12-byte RECEIVE envelope
 * npslib expects before forwarding.
 */
export async function handleSendNotSingleLong({
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
        log.warn(`NPS_SEND_NOT_SINGLE_LONG: bad envelope`, { connectionId, err, body: frame.toString('hex') });
        return { connectionId, messages: [] };
    }

    log.debug(`NPS_SEND_NOT_SINGLE_LONG`, {
        connectionId,
        commId: relay.commId,
        senderUserId: relay.senderUserId,
        filterUserId: relay.filterUserId,
        appType: relay.applicationPacketType,
    });

    const excludedId = getConnectionIdByUserId(relay.filterUserId);
    const members = getChannelMembers(relay.commId);
    const delivery = rewriteSingleEnvelope(frame);

    for (const memberId of members) {
        if (memberId === connectionId || memberId === excludedId) {
            continue;
        }
        try {
            getSocketQueue(memberId, 'send').put({ sequenceNo: -1, data: delivery });
        } catch {
            // Member queue gone; skip.
        }
    }

    return { connectionId, messages: [] };
}
