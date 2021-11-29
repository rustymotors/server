import { logger } from "../logger";
import { MPacket } from "./mpacket";
const log = logger.child({ service: "game_service" });

export async function processPacket(inputPacket: MPacket) {
  log.debug(
    { connection_id: inputPacket.getConnectionId() },
    "Start processing packet"
  );
}

export default { processPacket };
