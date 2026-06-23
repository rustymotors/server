import { BytableMessage } from '@rustymotors/binary';
import { databaseProvider, getServerLogger, type ServerLogger } from 'rusty-motors-shared';

export async function handleGetServerInfo({
    connectionId,
    message,
    log = getServerLogger('rooms.handleGetServerInfo'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{ connectionId: string; messages: BytableMessage[] }> {
    const request = new BytableMessage();
    request.setSerializeOrder([{ name: 'commId', field: 'Dword' }]);
    request.deserialize(message.serialize());

    const commId = (request.getFieldValueByName('commId') as Buffer).readInt32BE();
    log.debug(`[${connectionId}] NPS_GET_SERVER_INFO commId=${commId}`);

    let commPort: number;
    let commName: string;
    let commIp = '71.186.155.248';

    if (commId >= 221 && commId <= 240) {
        // MCC01-MCC20: commIds 221-240, ports 9001-9020
        const idx = commId - 220;
        commPort = 9000 + idx;
        commName = `MCC${String(idx).padStart(2, '0')}\n`;
    } else {
        // Dynamic game server (e.g. RACE channel from START_GAME_SERVER)
        const gameServers = await databaseProvider.getSessionStore().getGameServers();
        const gameServer = gameServers.find((s) => s.commId === commId);
        if (!gameServer) {
            throw new Error(`[${connectionId}] NPS_GET_SERVER_INFO: no entry for commId=${commId}`);
        }
        commPort = gameServer.port;
        commIp = gameServer.ipAddress;
        commName = 'RACE\n';
    }

    const outgoing = new BytableMessage();
    outgoing.setSerializeOrder([
        { name: 'riffName', field: 'PString' },
        { name: 'commId', field: 'Dword' },
        { name: 'ipAddress', field: 'PString' },
        { name: 'port', field: 'Dword' },
        { name: 'userId', field: 'Dword' },
        { name: 'playerCount', field: 'Dword' },
    ]);
    outgoing.header.setId(0x20d);
    outgoing.setVersion(0);
    outgoing.setFieldValueByName('riffName', commName);
    outgoing.setFieldValueByName('commId', commId);
    outgoing.setFieldValueByName('ipAddress', `${commIp}\n`);
    outgoing.setFieldValueByName('port', commPort);
    outgoing.setFieldValueByName('userId', 0);
    outgoing.setFieldValueByName('playerCount', 0);

    const packet = new BytableMessage();
    packet.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
    packet.setVersion(0);
    packet.deserialize(outgoing.serialize());

    return { connectionId, messages: [packet] };
}
