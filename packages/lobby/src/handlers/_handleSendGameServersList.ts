import { BytableMessage } from '@rustymotors/binary';
import { ServerLogger } from '@rustymotors/logging';
import * as Sentry from "@sentry/node"
import {
    getServerLogger,
} from 'rusty-motors-shared';
import { createGameServersListMessage } from './createGameServersListMessage.js';
export async function handleSendGameServersList({
    connectionId,
    message,
    log = getServerLogger('lobby.handleSendGameServersList'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableMessage[];
}> {
    try {
        log.debug(`Handling NPS_SEND_GAME_SERVERS_LIST`, {
            connectionId,
        });
        log.debug(`Received command: ${message.header.id}`, {
            connectionId,
        });

        // l
        log.debug(`User requested sendGameServerList`, {
            connectionId,
        })

        // TODO: Actually have servers
        // ppp
        const gameServerListMessage = createGameServersListMessage(log, connectionId);

        return {
            connectionId,
            messages: [gameServerListMessage],
        };
    } catch (error) {
        const err = Error(
            `[${connectionId}] Error handling NPS_SEND_GAME_SERVERS_LIST: ${String(error)}`,
        );
        err.cause = error;
        Sentry.captureException(err)
        throw err;
    }
}


