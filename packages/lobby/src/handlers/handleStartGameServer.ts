import { BytableMessage } from "@rustymotors/binary";
import {
    GameServerLaunchInfo,
    getServerLogger,
    RawMessage,
    ServerLogger,
} from "rusty-motors-shared";

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
            `[${connectionId}] Received command: ${message.header.messageId}`,
        );

        const startServerLaunchInfo = new GameServerLaunchInfo();
        startServerLaunchInfo.deserialize(message.getBody());

        const { commId, bestHost } = startServerLaunchInfo;

        log.debug(
            `client requested game server launch with comm id ${commId} on IP ${bestHost}`,
            { connectionId },
        );

        // TODO: Actually have servers

        const startedServerComm = Buffer.alloc(4);
        startedServerComm.writeInt32BE(commId);

        const gameServerStartedMessage = new RawMessage();
        gameServerStartedMessage.id = 0x21c; // NPS_GAME_SERVER_STARTED
        gameServerStartedMessage.data = startedServerComm;

        const outgoingMessage = new BytableMessage();
        outgoingMessage.deserialize(gameServerStartedMessage.serialize());

        return {
            connectionId,
            messages: [outgoingMessage],
        };
    } catch (error) {
        const err = Error(
            `[${connectionId}] Error handling ${SUPPORTED_MESSAGE}: ${String(error)}`,
        );
        err.cause = error;
        throw err;
    }
}