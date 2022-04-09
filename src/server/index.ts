import { logger } from "../logger/index.js";
import type { UnprocessedPacket } from "../types/index.js";
import { MPacket } from "./mpacket.js";
import { NPacket } from "./npacket.js";
import userService from "./userService.js";
import gameService from "./gameService.js";
const log = logger.child({ service: "server" });
/**
 * Is this an MCOT bound packet?
 *
 * @export
 * @param {Buffer} inputBuffer
 * @return {*}  {boolean}
 */
export function isMCOT(inputBuffer: Buffer): boolean {
  return inputBuffer.toString("utf8", 2, 6) === "TOMC";
}
/**
 * Route raw packet to correct service based on type
 *
 * @export
 * @param {UnprocessedPacket} inputConnection
 * @param {("tomc" | "tcp")} packetClass
 */
export function routePacket(
  inputConnection: UnprocessedPacket,
  packetClass: "tomc" | "tcp"
): void {
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

      log.debug(`mPacket: ${recievedPacket.toString()}`);
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

      log.debug(`nPacket: ${recievedPacket.toString()}`);
      void userService.processPacket(recievedPacket);
      break;
    }
  }
}
