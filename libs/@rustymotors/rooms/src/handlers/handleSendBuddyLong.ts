import { BytableMessage } from '@rustymotors/binary';
import { getServerLogger, type ServerLogger } from 'rusty-motors-shared';
import { logRelayStub } from './NpsRelaySingleMessage.js';

const defaultLogger = getServerLogger('rooms.handleSendBuddyLong');

/**
 * Handle NPS_SEND_BUDDY_LONG (opcode 0x93 / 147).
 *
 * Channel-relay primitive: forward the blob to one specific buddy user
 * identified by filterUserId. Wire layout matches the SINGLE-family
 * envelope — see NpsRelaySingleMessage.
 *
 * TODO(send-buddy-long): real relay — look up the buddy connection by
 *   userId (validating the buddy relationship if you want to enforce it)
 *   and push the blob to its send queue.
 */
export async function handleSendBuddyLong({
    connectionId,
    message,
    log = defaultLogger,
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableMessage[] }> {
    logRelayStub({
        opcodeName: 'NPS_SEND_BUDDY_LONG',
        connectionId,
        messageBytes: message.serialize(),
        log,
    });
    return { connectionId, messages: [] };
}
