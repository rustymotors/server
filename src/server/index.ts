import { logger } from "../logger";
import { UnprocessedPacket } from "../types";
const log = logger.child({service: 'server'})

export function isMCOT(inputBuffer: Buffer) {
  return inputBuffer.toString("utf8", 2, 6) === "TOMC";
}

export async function routePacket(inputConnection: UnprocessedPacket, packetClass: 'tomc' | 'tcp') {
    switch (packetClass) {
        case 'tomc':
            log.debug({connection_id: inputConnection.connectionId}, 'routing packet to the game database')
            break;
        case 'tcp':
            log.debug({connection_id: inputConnection.connectionId}, 'routing packet to user services')
            break;
    }
}
