import { GameMessage } from 'rusty-motors-shared';
import { LegacyMessage } from 'rusty-motors-shared';
import { serializeString } from 'rusty-motors-shared';
import { channelRecordSize, channels } from './channels.js';
import { getServerLogger, ServerLogger } from 'rusty-motors-logger';

const defaultLogger = getServerLogger('Lobby');

// const users = [user1];
/**
 * Constructs and returns a response containing the list of mini riff channels for a given connection.
 *
 * Builds a packet with channel information and serializes it into a legacy message format to be sent to the client.
 *
 * @param connectionId - The identifier for the client connection.
 * @param message - The incoming legacy message triggering this response.
 * @param log - Optional logger for debug output.
 * @returns An object with the original {@link connectionId} and the constructed legacy message containing channel data.
 *
 * @throws {Error} If an error occurs during packet construction or serialization.
 */
export async function handleSendMiniRiffList({
    connectionId,
    message,
    log = defaultLogger,
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: ServerLogger;
}) {
    log.debug('Handling NPS_SEND_MINI_RIFF_LIST');
    log.debug(`Received command: ${message._doSerialize().toString('hex')}`);

    const outgoingGameMessage = new GameMessage(1028);

    const resultSize = channelRecordSize * channels.length - 12;

    const packetContent = Buffer.alloc(resultSize);

    let offset = 0;
    try {
        packetContent.writeUInt32BE(channels.length, offset);
        offset += 4; // offset is 8

        // loop through the channels
        for (const channel of channels) {
            offset = serializeString(channel.name, packetContent, offset);

            packetContent.writeUInt32BE(channel.id, offset);
            offset += 4;
            packetContent.writeUInt16BE(channel.population, offset);
            offset += 2;
        }

        outgoingGameMessage.setRecordData(packetContent);

        // Build the packet
        const packetResult = new LegacyMessage();
        packetResult._doDeserialize(outgoingGameMessage.serialize());

        log.debug(
            `Sending response: ${packetResult.serialize().toString('hex')}`,
        );

        return {
            connectionId,
            message: packetResult,
        };
    } catch (error) {
        const err = Error(
            `Error handling NPS_SEND_MINI_RIFF_LIST: ${String(error)}`,
        );
        err.cause = error;
        throw err;
    }
}
