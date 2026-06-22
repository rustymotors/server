import { BytableMessage } from "@rustymotors/binary";
import {
    GameServerLaunchInfo,
    getServerLogger,
    RunningServerInfo,
    type ServerLogger,
    databaseProvider,
} from "rusty-motors-shared";
import { createUserJoinedChannelMessage } from "./createUserJoinedChannelMessage.js";

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
    const SUPPORTED_MESSAGE = "NPS_START_GAME_SERVER";
    try {
        log.debug(`[${connectionId}] Handling ${SUPPORTED_MESSAGE}`);
        log.debug(`[${connectionId}] Received command: ${message.header.id}`);

        const startServerLaunchInfo = new GameServerLaunchInfo();
        startServerLaunchInfo.deserialize(message.getBody());

        const { commId, bestHost } = startServerLaunchInfo;

        const userId = await databaseProvider
            .getSessionStore()
            .findUserByConnectionId(connectionId);

        if (!userId) {
            throw new Error(
                `Unable to find user for connection ${connectionId}`,
            );
        }

        log.verbose(
            `client requested game server launch with comm id ${commId} on IP ${bestHost} for user ${userId}`,
            { connectionId },
        );

        // TODO: Actually have servers
        // 0x20d NPS_SERVER_INFO - _NPS_RunningServerInfo
        const newServerInfo = new RunningServerInfo();
        newServerInfo.riff = "RACE";
        newServerInfo.commId = commId;
        newServerInfo.ipAddress = "71.186.155.248";
        newServerInfo.port = 9000;
        newServerInfo.userId = 21;
        newServerInfo.numberOfPlayers = 1;

        databaseProvider
            .getSessionStore()
            .updateGameServer(commId, newServerInfo);

        const startedServerComm = Buffer.alloc(4);
        startedServerComm.writeInt32BE(commId);

        const gameServerInfoMessage = new BytableMessage();
        gameServerInfoMessage.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
        gameServerInfoMessage.setVersion(0);
        gameServerInfoMessage.header.setId(0x20d);
        gameServerInfoMessage.setFieldValueByName('data', newServerInfo.serialize());

        const gameServerStartupAcknowledgment = new BytableMessage();
        gameServerStartupAcknowledgment.setSerializeOrder([{ name: 'data', field: 'Buffer' }]);
        gameServerStartupAcknowledgment.setVersion(0);
        gameServerStartupAcknowledgment.header.setId(0x21c); // NPS_GAME_SERVER_STARTED
        gameServerStartupAcknowledgment.setFieldValueByName('data', startedServerComm);

        const joinedChannelMessage = await createUserJoinedChannelMessage(
            userId,
            startedServerComm.readUInt32BE(),
            log,
            connectionId,
        );

        return {
            connectionId,
            messages: [
                // gameServerInfoMessage,
                joinedChannelMessage,
                gameServerStartupAcknowledgment,
            ],
        };
    } catch (error) {
        const err = Error(
            `[${connectionId}] Error handling ${SUPPORTED_MESSAGE}: ${String(error)}`,
        );
        err.cause = error;
        throw err;
    }
}
