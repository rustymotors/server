import { BytableBuffer, BytableMessage } from '@rustymotors/binary';
import type { ServerLogger } from 'rusty-motors-shared';

export async function handleTrackingPing({
    connectionId,
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableBuffer[] }> {
    // Header only (version 0): id 0x217, length 4, no payload
    const response = new BytableMessage(0);
    response.header.setId(0x217);
    const packet = new BytableBuffer();
    packet.deserialize(response.serialize());
    return { connectionId, messages: [packet] };
}
