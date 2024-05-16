import { GameMessage } from "@rustymotors/nps";
import type { GameSocketCallback } from "./index.js";

import type { UserStatus } from "@rustymotors/nps";
import { sendNPSAck } from "@rustymotors/nps";
import { getServerLogger } from "@rustymotors/shared";

const log = getServerLogger();

export async function processPing(
  connectionId: string,
  userStatus: UserStatus,
  message: GameMessage,
  socketCallback: GameSocketCallback
): Promise<void> {
  log.setName("nps:processPing");
  log.info(`Ping: ${message.toString()}`);

  sendNPSAck(socketCallback);
  log.resetName();
  return Promise.resolve();
}
