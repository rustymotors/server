import { GameMessage } from "nps";
import type { GameSocketCallback } from "./index.js";

import type { UserStatus } from "nps";
import { sendNPSAck } from "nps";
import { getServerLogger } from "shared";

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
