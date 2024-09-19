import {
    NPSMessage,
    getServerLogger,
    type ServiceResponse,
} from "rusty-motors-shared";
import { getAsHex, type Serializable } from "rusty-motors-shared-packets";

/**
 * Receive chat data
 *
 * @param connectionId - Connection ID
 * @param message - Message
 * @returns Service response
 */
async function receiveChatData({
    connectionId,
    message,
}: {
    connectionId: string;
    message: Serializable;
}): Promise<ServiceResponse> {
    const log = getServerLogger({ name: "chat" });

    log.info(`Received chat data from connection ${connectionId}`);
    log.debug(`Message: ${message.toHexString()}`);

    const inboundMessage = new NPSMessage();
    inboundMessage._doDeserialize(message.serialize());

    log.debug(`Deserialized message: ${getAsHex(inboundMessage.serialize())}`);

    const id = inboundMessage._header.id;

    log.debug(`Message ID: ${id}`);

    // const userStatus = UserStatusManager.getUserStatus(connectionId);

    throw new Error(
        `Unable to process chat data from connection ${connectionId}, data: ${message.toHexString()}`,
    );
}

export { receiveChatData };
