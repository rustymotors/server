import type { Connection } from "@prisma/client";
import { NPSMessage } from "../NPSMessage.js";

/**
 * @private
 * @param {Connection} _connection
 * @param {Buffer} data
 * @return {NPSMessage}}
 */
export async function _npsHeartbeat(
    _connection: Connection,
    _data: Buffer
): Promise<NPSMessage> {
    const packetContent = Buffer.alloc(8);
    const packetResult = new NPSMessage("sent");
    packetResult.msgNo = 0x1_27;
    packetResult.setContent(packetContent);
    packetResult.dumpPacket();
    return packetResult;
}
