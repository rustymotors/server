import { getServerLogger } from "../../../shared/log.js";
import { ServerError } from "../../../shared/errors/ServerError.js";
import { LegacyMessage } from "../../../shared/messageFactory.js";
import { UserInfo } from "../UserInfoMessage.js";
import { getServerConfiguration } from "../../../shared/Configuration.js";

export async function _setMyUserData({
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

    try {
        log.debug("Handling NPS_SET_MY_USER_DATA");
        log.debug(`Received command: ${message.serialize().toString("hex")}`);

        const incomingMessage = new UserInfo();
        incomingMessage.deserialize(message.serialize());

        log.debug(`User ID: ${incomingMessage._userId}`);

        // TODO: Here we should update the user's data in the database
        // Then we should send a response of the user's data
        // Build the packet
        const packetResult = new LegacyMessage();
        packetResult._header.id = 516;
        packetResult.deserialize(incomingMessage.serialize());

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
            "Error handling NPS_SET_MY_USER_DATA",
        );
    }
}
