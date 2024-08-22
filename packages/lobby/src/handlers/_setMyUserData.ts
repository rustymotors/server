import { getServerConfiguration } from "../../../shared/Configuration.js";
import { ServerError } from "../../../shared/errors/ServerError.js";
import { getServerLogger } from "../../../shared/log.js";
import { LegacyMessage } from "../../../shared/LegacyMessage.js";
import { UserInfo } from "../UserInfoMessage.js";
import { updateUser } from "../../../database/index.js";

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


        // Update the user's data
        updateUser({
            userId: incomingMessage._userId,
            userData: incomingMessage._userData,
        });

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
