import { ServerLogger, getServerLogger } from "@rustymotors/shared";
import {
    GameMessage,
    LegacyMessage,
    serializeString,
} from "@rustymotors/shared";
import { channelRecordSize, channels } from "./encryptedCommand.js";

// const users = [user1];
/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {ServerLogger} args.log
 */
export async function handleSendMiniRiffList({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: LegacyMessage;
    log: ServerLogger;
}) {
    log.debug("Handling NPS_SEND_MINI_RIFF_LIST");
    log.debug(`Received command: ${message._doSerialize().toString("hex")}`);

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
            `Sending response: ${packetResult.serialize().toString("hex")}`,
        );

        return {
            connectionId,
            message: packetResult,
        };
    } catch (error) {
        log.error(`Error handling NPS_SEND_MINI_RIFF_LIST: ${String(error)}`);
        throw Error(`Error handling NPS_SEND_MINI_RIFF_LIST: ${String(error)}`);
    }
}
