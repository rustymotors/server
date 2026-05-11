import type { BytableMessage } from '@rustymotors/binary';
import { getServerLogger, getSocketQueue, type ServerLogger } from 'rusty-motors-shared';
import { getRoomHandlerRegistry } from './handlers/registry.js';

export async function receiveRoomData({
    connectionId,
    message,
    log = getServerLogger('rooms.receiveRoomData'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: [] }> {
    const registry = getRoomHandlerRegistry();
    const entry = registry.getHandler(message.header.id);

    if (!entry) {
        log.error(`[${connectionId}] unsupported opCode=0x${message.header.id.toString(16)}`);
        return { connectionId, messages: [] };
    }

    const result = await entry.handler({ connectionId, message, log });

    const sendQueue = getSocketQueue(connectionId, 'send');
    for (const response of result.messages) {
        sendQueue.put({ sequenceNo: -1, data: response.serialize() });
    }

    return { connectionId, messages: [] };
}
