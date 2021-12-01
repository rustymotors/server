import { logger } from "../logger";
import { UnprocessedPacket } from "../types";
import { MPacket } from "./mpacket";
import { NPacket } from "./npacket";
import userService from "./userService";
import gameService from "./gameService";
const log = logger.child({ service: "server" });

export function isMCOT(inputBuffer: Buffer) {
  return inputBuffer.toString("utf8", 2, 6) === "TOMC";
}

export async function routePacket(
  inputConnection: UnprocessedPacket,
  packetClass: "tomc" | "tcp"
) {
  switch (packetClass) {
    case "tomc": {
      log.debug(
        { connection_id: inputConnection.connectionId },
        "routing packet to the game database"
      );
      const recievedPacket = MPacket.deserialize(
        inputConnection.data,
        inputConnection.connectionId
      );

      log.debug(`mPacket: ${recievedPacket}`);
      void gameService.processPacket(recievedPacket);

      break;
    }
    case "tcp": {
      log.debug(
        { connection_id: inputConnection.connectionId },
        "routing packet to user services"
      );
      const recievedPacket = NPacket.deserialize(
        inputConnection.data,
        inputConnection.connectionId
      );

      log.debug(`nPacket: ${recievedPacket}`);
      void userService.processPacket(recievedPacket);
      break;
    }
  }
}
