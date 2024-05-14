import { SetOptionsMessage } from "mcots";
import { getServerLogger } from "shared";
import { ServerMessage } from "shared-packets";
import type { ServerSocketCallback } from "./index.js";
import { sendSuccess } from "./sendSuccess.js";

const log = getServerLogger();

export async function processSetOptions(
  connectionId: string,
  message: ServerMessage,
  socketCallback: ServerSocketCallback
) {
  log.setName("processSetOptions");
  log.info(`Processing SetOptionsMessage`);
  const setOptionsMessage = new SetOptionsMessage().deserialize(
    message.getDataBuffer()
  );
  log.info(`SetOptionsMessage: ${setOptionsMessage.toString()}`);

  // TODO: Implement the logic for processing the SetOptionsMessage

  sendSuccess(message, socketCallback);

  log.resetName();
  return Promise.resolve();
}
