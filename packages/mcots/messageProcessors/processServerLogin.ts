import type { ServerSocketCallback } from ".";
import { ServerMessage } from "../../shared-packets/src/ServerMessage";
import { LoginMessage } from "../payloads/LoginMessage";
import { getServerLogger } from "../../shared";
import { LoginCompleteMessage } from "../payloads/LoginCompleteMessage";

const log = getServerLogger();

export async function processServerLogin(
    connectionId: string,
    message: ServerMessage,
    socketCallback: ServerSocketCallback,
): Promise<void> {
    log.setName("processServerLogin");
    // Read the inbound packet
    const loginMessage = new LoginMessage(message.getDataBuffer().length);
    loginMessage.deserialize(message.getDataBuffer());
    log.debug(`Received LoginMessage: ${loginMessage.toString()}`);

    // Create new response packet
    const response = new LoginCompleteMessage();
    response.setMessageId(213);
    response.setServerTime(Math.floor(Date.now() / 1000));
    response.setFirstTime(true);

    log.debug(`Sending LoginCompleteMessage: ${response.toString()}`);

    // Send response packet
    const responsePacket = new ServerMessage(response.getMessageId());
    responsePacket.setData(response);
    responsePacket.populateHeader(message.getSequence());


    socketCallback([responsePacket]);
    log.resetName();
    return Promise.resolve();
}
