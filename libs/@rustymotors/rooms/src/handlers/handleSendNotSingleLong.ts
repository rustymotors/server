import { BytableMessage } from '@rustymotors/binary';
import { getServerLogger, type ServerLogger } from 'rusty-motors-shared';
import { logRelayStub } from './NpsRelaySingleMessage.js';

const defaultLogger = getServerLogger('rooms.handleSendNotSingleLong');

/**
 * Handle NPS_SEND_NOT_SINGLE_LONG (opcode 0x97 / 151).
 *
 * Channel-relay primitive: forward the blob to every channel member EXCEPT
 * the user identified by filterUserId (typically the sender themselves).
 * Used during race for position updates, score sync, and end-of-race stats.
 *
 * TODO(send-not-single-long): real relay — push blob to every other member's
 *   send queue, keyed by commId. Needs a channel-membership map.
 */
export async function handleSendNotSingleLong({
    connectionId,
    message,
    log = defaultLogger,
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableMessage[] }> {
    logRelayStub({
        opcodeName: 'NPS_SEND_NOT_SINGLE_LONG',
        connectionId,
        messageBytes: message.serialize(),
        log,
    });
    return { connectionId, messages: [] };
}
