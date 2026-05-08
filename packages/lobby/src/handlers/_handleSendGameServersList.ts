import { BytableMessage } from '@rustymotors/binary';
import { ServerLogger } from '@rustymotors/logging';
import * as Sentry from "@sentry/node"
import {
    getServerLogger,
    RawMessage,
    ChannelCreated,
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
        const responsePackets = []

        const channelCreatedMessage = new RawMessage();
        channelCreatedMessage.id = 0x20e
        const channelCreatedBody = new ChannelCreated();
        channelCreatedBody.commId = 2;
        channelCreatedBody.riff = 'RACE';
        channelCreatedBody.protocol = 33;
        channelCreatedBody.channelData.hostID = 21
        channelCreatedBody.channelType = 3;
        channelCreatedBody.maxReadyPlayers = 1;


        channelCreatedMessage.data = channelCreatedBody.serialize();
        const channelCreatedBytable = new BytableMessage();
        channelCreatedBytable.setSerializeOrder([
            { name: 'data', field: 'Buffer' },
        ]);
        channelCreatedBytable.setVersion(0);
        channelCreatedBytable.deserialize(channelCreatedMessage.serialize());

        // ppp
        const gameServerListMessage = createGameServersListMessage(log, connectionId);

        responsePackets.push(gameServerListMessage)

        return {
            connectionId,
            messages: responsePackets,
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


