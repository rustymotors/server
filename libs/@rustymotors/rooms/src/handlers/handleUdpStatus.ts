import type { BytableMessage } from '@rustymotors/binary';
import type { ServerLogger } from 'rusty-motors-shared';

export async function handleUdpStatus({
    connectionId,
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableMessage[] }> {
    return { connectionId, messages: [] };
}
