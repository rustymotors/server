import { logger } from "../logger";
import { NPacket } from "./npacket";
const log = logger.child({ service: "user_service" });

export async function processPacket(inputPacket: NPacket) {
  log.debug(
    { connection_id: inputPacket.getConnectionId() },
    "Start processing packet"
  );
}

export default { processPacket };
