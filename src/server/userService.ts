import { logger } from "../logger/index.js";
import type { NPacket } from "./npacket.js";
const log = logger.child({ service: "user_service" });
/**
 * Handles an incomming NPS Packet
 * TODO: Implement
 *
 * @export
 * @param {NPacket} inputPacket
 */
export function processPacket(inputPacket: NPacket): void {
  log.debug(
    { connection_id: inputPacket.getConnectionId() },
    "Start processing packet"
  );
}

export default { processPacket };
