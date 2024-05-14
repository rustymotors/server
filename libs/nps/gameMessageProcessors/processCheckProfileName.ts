import { GameMessage, getLenString } from "nps";
import type { GameSocketCallback } from "./index.js";

import type { UserStatus } from "nps";
import { getServerLogger } from "shared";

const log = getServerLogger();

export async function processCheckProfileName(
  connectionId: string,
  userStatus: UserStatus,
  message: GameMessage,
  socketCallback: GameSocketCallback
): Promise<void> {
  log.setName("nps:processCheckProfileName");
  const customerId = message.serialize().readUInt32BE(8);

  const requestedPersonaName = getLenString(message.serialize(), 12, false);

  log.info(
    `Requested persona name: ${requestedPersonaName} for customer ${customerId}`
  );

  const response = new GameMessage(0);
  response.header.setId(0x601);

  const responseBytes = response.serialize();

  socketCallback([responseBytes]);
  log.resetName();
  return Promise.resolve();
}
