import { ClientTrackingMessage } from "@rustymotors/mcots";
import { getServerLogger } from "@rustymotors/shared";
import type { ServerMessage } from "@rustymotors/shared-packets";
import type { ServerSocketCallback } from "./index.js";

const log = getServerLogger();

export async function processClientTracking(
  connectionId: string,
  message: ServerMessage,
  socketCallback: ServerSocketCallback
) {
  log.setName("processClientTracking");

  log.debug(`Processing client tracking message`);

  const trackingMessage = new ClientTrackingMessage(0).deserialize(
    message.serialize()
  );

  log.debug(
    `Type: ${trackingMessage.getType()}, Tracking Text: ${trackingMessage.getTrackingText()}`
  );

  // Do something with the tracking data

  log.resetName();
  void socketCallback([]);

  return Promise.resolve();
}
