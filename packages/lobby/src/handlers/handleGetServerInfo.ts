import { BytableMessage } from '@rustymotors/binary';
import { getServerLogger, type ServerLogger, databaseProvider } from 'rusty-motors-shared';
import { chatChannelIds } from './channels.js';

export async function handleGetServerInfo({
    connectionId,
    message,
    log = getServerLogger('lobby.handleGetServerInfo'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableMessage[];
}> {
    try {
        log.debug(`[${connectionId}] Handling NPS_GET_SERVER_INFO`);
        log.debug(
            `[${connectionId}] Received command: ${message.header.id}`,
        );

        // l
        const incomingRequest = new BytableMessage();
        incomingRequest.setSerializeOrder([{ name: 'commId', field: 'Dword' }]);
        incomingRequest.deserialize(message.serialize());

        const requestedCommId =
            incomingRequest.getFieldValueByName('commId') ?? -1;

        const cID = (requestedCommId as Buffer).readInt32BE();

        log.debug(`Received commId: ${cID}`, {
            connectionId,
        });

        let commPort;
        let commName;
        let commIp = '71.186.155.248';

        if (cID > 0 && cID < 21) {
            const port = chatChannelIds[cID - 1];
            if (typeof port === 'undefined') {
                throw new Error(
                    `Why can't you find a channel id for ${cID - 1}?`,
                );
            }

            commPort = parseInt(`90${port}`);
            commName = `MCC${commPort}\n`;
        } else if (cID === 10001) {
            commPort = parseInt('10001');
            commName = 'MC100';
        } else {
            // Look up game server from session store
            const sessionStore = databaseProvider.getSessionStore();
            const gameServers = await sessionStore.getGameServers();
            const gameServer = gameServers.find((s) => s.commId === cID);
            if (!gameServer) {
                throw new Error(`Can't find entry for commId ${cID}`);
            }
            commPort = gameServer.port;
            commIp = gameServer.ipAddress;
            commName = 'RACE\n';
        }

        // plplll
        const outgoingGameMessage = new BytableMessage();
        outgoingGameMessage.setSerializeOrder([
            { name: 'riffName', field: 'String' },
            { name: 'commId', field: 'Dword' },
            { name: 'ipAddress', field: 'String' },
            { name: 'port', field: 'Dword' },
            { name: 'userId', field: 'Dword' },
            { name: 'playerCount', field: 'Dword' },
        ]);

        outgoingGameMessage.header.setId(525);
        outgoingGameMessage.setVersion(0);
        outgoingGameMessage.setFieldValueByName('riffName', commName);
        outgoingGameMessage.setFieldValueByName('commId', requestedCommId);
        outgoingGameMessage.setFieldValueByName(
            'ipAddress',
            `${commIp}\n`,
        );
        outgoingGameMessage.setFieldValueByName('port', commPort);
        outgoingGameMessage.setFieldValueByName('userId', 21);
        outgoingGameMessage.setFieldValueByName('playerCount', 1);

        // Build the packet
        const packetResult = new BytableMessage();
        packetResult.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
        packetResult.setVersion(0);
        packetResult.deserialize(outgoingGameMessage.serialize());

        log.debug(
            `Sending response[serialize2]: ${packetResult.serialize().toString('hex')}`,
            { connectionId },
        );

        return {
            connectionId,
            messages: [packetResult],
        };
    } catch (error) {
        const err = Error(
            `[${connectionId}] Error handling NPS_GET_SERVER_INFO: ${String(error)}`,
        );
        err.cause = error;
        throw err;
    }
}
