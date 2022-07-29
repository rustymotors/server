import type { BufferWithConnection, GSMessageArrayWithConnection } from "mcos-types/types.js"
import { NPSMessage } from "../NPSMessage.js"

/**
   * @private
   * @return {NPSMessage}}
   */
 export async function _npsHeartbeat (dataConnection: BufferWithConnection): Promise<GSMessageArrayWithConnection> {
  const packetContent = Buffer.alloc(8)
  const packetResult = new NPSMessage('sent')
  packetResult.msgNo = 0x1_27
  packetResult.setContent(packetContent)
  packetResult.dumpPacket()
  return {
    connection: dataConnection.connection,
    messages: [packetResult],
  };
}
