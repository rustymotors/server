import type { UserStatus } from "nps";
import { GameMessage, getLenString, sendNPSAck } from "nps";
import { getServerLogger } from "shared";
import type { GameSocketCallback } from "./index.js";

const log = getServerLogger();

export async function processCheckPlateText(
  connectionId: string,
  userStatus: UserStatus,
  message: GameMessage,
  socketCallback: GameSocketCallback
): Promise<void> {
  log.setName("nps:processCheckPlateText");

  const plateType = message.getDataAsBuffer().readUInt32BE(0);

  const requestedPlateText = getLenString(message.getDataAsBuffer(), 4, false);

  log.info(
    `Requested plate text: ${requestedPlateText} for plate type ${plateType}`
  );

  sendNPSAck(socketCallback);
  log.resetName();
  return Promise.resolve();
}
