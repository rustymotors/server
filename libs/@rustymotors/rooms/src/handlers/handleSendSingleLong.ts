import { BytableMessage } from '@rustymotors/binary';
import { getServerLogger, type ServerLogger } from 'rusty-motors-shared';
import { logRelayStub } from './NpsRelaySingleMessage.js';

const defaultLogger = getServerLogger('rooms.handleSendSingleLong');

/**
 * Handle NPS_SEND_SINGLE_LONG (opcode 0x95 / 149).
 *
 * Channel-relay primitive: forward the blob to one specific user identified
 * by filterUserId (a direct message). Wire layout matches the SINGLE-family
 * envelope — see NpsRelaySingleMessage.
 *
 * TODO(send-single-long): real relay — look up the recipient connection by
 *   userId and push the blob to its send queue. No-op for single-player.
 */
export async function handleSendSingleLong({
    connectionId,
    message,
    log = defaultLogger,
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableMessage[] }> {
    logRelayStub({
        opcodeName: 'NPS_SEND_SINGLE_LONG',
        connectionId,
        messageBytes: message.serialize(),
        log,
    });
    return { connectionId, messages: [] };
}
