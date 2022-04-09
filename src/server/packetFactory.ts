import type { UnprocessedPacket } from "../types/index.js";
import { MPacket } from "./mpacket.js";
import { NPacket } from "./npacket.js";
export function wrapPacket(packet: UnprocessedPacket, packetClass: string) {
  if (packetClass === "tomc") {
    return MPacket.deserialize(packet.data);
  }

  return NPacket.deserialize(packet.data);
}
