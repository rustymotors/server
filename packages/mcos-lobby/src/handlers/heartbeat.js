import { NPSMessage } from '../../../mcos-gateway/src/NPSMessage.js'


/**
 * @private
 * @param {import('../../../mcos-gateway/src/sockets.js').BufferWithConnection} dataConnection
 * @return {Promise<import('../../../mcos-gateway/src/sockets.js').GSMessageArrayWithConnection>}}
 */
export async function _npsHeartbeat(
    dataConnection
) {
    const packetContent = Buffer.alloc(8);
    const packetResult = new NPSMessage("sent");
    packetResult.msgNo = 0x1_27;
    packetResult.setContent(packetContent);
    packetResult.dumpPacket();
    return {
        connection: dataConnection.connection,
        messages: [packetResult],
    };
}
