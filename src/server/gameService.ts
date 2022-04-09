import { logger } from "../logger/index.js";
import type { MPacket } from "./mpacket.js";
const log = logger.child({ service: "game_service" });
/**
 * Handle an incoming packate bound for the game service
 *
 * @export
 * @param {MPacket} inputPacket
 */
export function processPacket(inputPacket: MPacket): void {
  log.debug(
    { connection_id: inputPacket.getConnectionId() },
    "Start processing packet"
  );
}

export default { processPacket };
