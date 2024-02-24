import { ServerLogger, getServerLogger } from "../../../shared/log.js";
import { LegacyMessage } from "../../../shared/messageFactory.js";
import { UserInfo } from "../UserInfoMessage.js";
import { getServerConfiguration } from "../../../shared/Configuration.js";
import { getDatabaseServer } from "../../../database/src/DatabaseManager.js";

export async function _setMyUserData({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: LegacyMessage;
    log: ServerLogger;
}) {
    try {
        log.debug("Handling NPS_SET_MY_USER_DATA");
        log.debug(`Received command: ${message.serialize().toString("hex")}`);

        const incomingMessage = new UserInfo();
        incomingMessage.deserialize(message.serialize());

        log.debug(`User ID: ${incomingMessage._userId}`);

        // Get the database instance
        const db = getDatabaseServer(log);

        // Update the user's data
        db.updateUser({
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
        log.error(`Error handling NPS_SET_MY_USER_DATA: ${String(error)}`);
        throw Error(`Error handling NPS_SET_MY_USER_DATA: ${String(error)}`);
    }
}
