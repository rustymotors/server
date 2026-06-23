import type { BytableMessage } from '@rustymotors/binary';
import { BytableBuffer } from '@rustymotors/binary';
import { RawMessage } from 'rusty-motors-shared';
import type { ServerLogger } from 'rusty-motors-shared';

export async function handleTrackingPing({
    connectionId,
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableBuffer[] }> {
    const response = new RawMessage();
    response.id = 0x217;
    response.length = 4;
    const packet = new BytableBuffer();
    packet.deserialize(response.serialize());
    return { connectionId, messages: [packet] };
}
