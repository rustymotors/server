import type { UnprocessedPacket } from "../types/index";
import { MPacket } from "./mpacket";
import { NPacket } from "./npacket";
export function wrapPacket(packet: UnprocessedPacket, packetClass: string) {
  if (packetClass === "tomc") {
    return MPacket.deserialize(packet.data);
  }

  return NPacket.deserialize(packet.data);
}
