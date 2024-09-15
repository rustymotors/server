import {
    GameMessage,
    getServerLogger,
    type ServiceResponse,
} from "rusty-motors-shared";
import type { Serializable } from "rusty-motors-shared-packets";

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
    const log = getServerLogger({});

    log.info(`Received chat data from connection ${connectionId}`);
    log.debug(`Message: ${message.toHexString()}`);

    const inboundMessage = new GameMessage(0);
    inboundMessage.deserialize(message.serialize());

    log.debug(`Deserialized message: ${inboundMessage.toHexString()}`);

    const id = inboundMessage._header.id;

    log.debug(`Message ID: ${id}`);

    throw new Error(
        `Unable to process chat data from connection ${connectionId}, data: ${message.toHexString()}`,
    );

    return {
        connectionId,
        messages: [],
    };
}

export { receiveChatData };
