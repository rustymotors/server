import { type TServerLogger, LegacyMessage } from "../../../shared";
import { UserInfo } from "../UserInfoMessage.js";
import { updateUser } from "../../../database";

export async function _setMyUserData({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: LegacyMessage;
    log: TServerLogger;
}) {
    try {
        log.debug("Handling NPS_SET_MY_USER_DATA");
        log.debug(`Received command: ${message.serialize().toString("hex")}`);

        const incomingMessage = new UserInfo();
        incomingMessage.deserialize(message.serialize());

        log.debug(`User ID: ${incomingMessage._userId}`);

        // Update the user's data
        await updateUser({
            userId: incomingMessage._userId,
            userData: incomingMessage._userData,
        }).catch((error) => {
            log.error(`Error updating user data: ${String(error)}`);
            throw Error(`Error updating user data: ${String(error)}`);
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
