import { getServerLogger } from "../../../shared/log.js";
import { ServerError } from "../../../shared/errors/ServerError.js";
import {
    LegacyMessage,
    serializeString,
} from "../../../shared/messageFactory.js";
import { getServerConfiguration } from "../../../shared/Configuration.js";
import { channelRecordSize, channels } from "./encryptedCommand.js";

// const users = [user1];
/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 */
export function handleSendMiniRiffList({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: import("pino").Logger;
}) {
    log.level = getServerConfiguration({}).logLevel ?? "info";

    log.debug("Handling NPS_SEND_MINI_RIFF_LIST");
    log.debug(`Received command: ${message._doSerialize().toString("hex")}`);

    const resultSize = 4 + channelRecordSize * channels.length;

    const packetContent = Buffer.alloc(resultSize + 6);

    try {
        // Add the response code
        packetContent.writeUInt16BE(1028, 0);
        let offset = 2;
        packetContent.writeUInt16BE(resultSize, offset);
        offset += 2;

        packetContent.writeUInt16BE(channels.length, offset);
        offset += 2;

        // loop through the channels
        for (const channel of channels) {
            offset += serializeString(channel.name, packetContent, offset);

            packetContent.writeUInt16BE(channel.id, offset);
            offset += 2;
            packetContent.writeUInt16BE(channel.population, offset);
            offset += 2;
        }

        // Build the packet
        const packetResult = new LegacyMessage();
        packetResult._header.id = 4353;
        packetResult._header.length = resultSize;
        packetResult.setBuffer(packetContent);

        log.debug(
            `Sending response: ${packetResult.serialize().toString("hex")}`,
        );

        return {
            connectionId,
            message: packetResult,
        };
    } catch (error) {
        throw ServerError.fromUnknown(
            error,
            "Error handling NPS_SEND_MINI_RIFF_LIST",
        );
    }
}
