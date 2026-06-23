import { BytableMessage } from '@rustymotors/binary';
import {
    GameServerInfo,
    GameServerListMessage,
    getServerLogger,
    type ServerLogger,
} from 'rusty-motors-shared';

export async function handleSendGameServersList({
    connectionId,
    log = getServerLogger('rooms.handleSendGameServersList'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableMessage[] }> {
    log.debug(`[${connectionId}] NPS_SEND_GAME_SERVERS_LIST`);

    const outgoing = new GameServerListMessage();
    outgoing.id = 0x402;
    outgoing.add(new GameServerInfo('RACE', '71.186.155.248'));

    const packet = new BytableMessage();
    packet.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
    packet.setVersion(0);
    packet.deserialize(outgoing.serialize());

    return { connectionId, messages: [packet] };
}
