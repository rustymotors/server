import { getServerLogger } from "../../shared/src/log";
import { ServerMessage } from "../../shared-packets/src/ServerMessage";
import { SetOptionsMessage } from "../payloads/SetOptionsMessage";
import type { ServerSocketCallback } from "./index";
import { sendSuccess } from "./sendSuccess";

const log = getServerLogger();


export async function processSetOptions(
    connectionId: string,
    message: ServerMessage,
    socketCallback: ServerSocketCallback,
) {
    log.setName("processSetOptions");
    log.info(`Processing SetOptionsMessage`);
    const setOptionsMessage = new SetOptionsMessage().deserialize(
        message.getDataBuffer(),
    );
    log.info(`SetOptionsMessage: ${setOptionsMessage.toString()}`);

    // TODO: Implement the logic for processing the SetOptionsMessage

    sendSuccess(message, socketCallback);

    log.resetName();
    return Promise.resolve();
}
