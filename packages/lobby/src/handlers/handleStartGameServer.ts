import { BytableMessage } from '@rustymotors/binary';
import {
    GameServerLaunchInfo,
    getServerLogger,
    RawMessage,
    RunningServerInfo,
    type ServerLogger,
    databaseProvider,
} from 'rusty-motors-shared';

export async function handleStartGameServer({
    connectionId,
    message,
    log = getServerLogger(`lobby.handleStartGameServer`),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableMessage[];
}> {
    const SUPPORTED_MESSAGE = 'NPS_START_GAME_SERVER';
    try {
        log.debug(`[${connectionId}] Handling ${SUPPORTED_MESSAGE}`);
        log.debug(
            `[${connectionId}] Received command: ${message.header.id}`,
        );

        const startServerLaunchInfo = new GameServerLaunchInfo();
        startServerLaunchInfo.deserialize(message.getBody());

        const { commId, bestHost } = startServerLaunchInfo;

        log.debug(
            `client requested game server launch with comm id ${commId} on IP ${bestHost}`,
            { connectionId },
        );

        // TODO: Actually have servers
        // 0x20d NPS_SERVER_INFO - _NPS_RunningServerInfo
        const newServerInfo = new RunningServerInfo();
        newServerInfo.riff = 'RACE';
        newServerInfo.commId = commId;
        newServerInfo.ipAddress = '71.186.155.248';
        newServerInfo.port = 9000;
        newServerInfo.userId = 21;
        newServerInfo.numberOfPlayers = 1;

        databaseProvider.getSessionStore().updateGameServer(commId, newServerInfo)

        const newServerInfoMessage = new RawMessage();
        newServerInfoMessage.id = 0x20d;
        newServerInfoMessage.data = newServerInfo.serialize();

        const startedServerComm = Buffer.alloc(4);
        startedServerComm.writeInt32BE(commId);

        const gameServerStartedMessage = new RawMessage();
        gameServerStartedMessage.id = 0x21c; // NPS_GAME_SERVER_STARTED
        gameServerStartedMessage.data = startedServerComm;

        const outgoingMessage1 = new BytableMessage();
        outgoingMessage1.deserialize(newServerInfoMessage.serialize());

        const outgoingMessage2 = new BytableMessage();
        outgoingMessage2.deserialize(gameServerStartedMessage.serialize());

        return {
            connectionId,
            messages: [outgoingMessage1, outgoingMessage2],
        };
    } catch (error) {
        const err = Error(
            `[${connectionId}] Error handling ${SUPPORTED_MESSAGE}: ${String(error)}`,
        );
        err.cause = error;
        throw err;
    }
}
