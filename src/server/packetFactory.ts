import type { UnprocessedPacket } from "../types/index.js";
import { MPacket } from "./mpacket.js";
import { NPacket } from "./npacket.js";
/**
 * Marshell a raw data backet into either an MPacket, or an NPacket
 *
 * @export
 * @param {UnprocessedPacket} packet
 * @param {string} packetClass
 * @return {MPacket | NPacket} 
 */
export function wrapPacket(packet: UnprocessedPacket, packetClass: string): MPacket | NPacket {
  if (packetClass === "tomc") {
    return MPacket.deserialize(packet.data);
  }

  return NPacket.deserialize(packet.data);
}
