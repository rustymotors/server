import {
    NPSMessage,
    TBufferWithConnection,
    TMessageArrayWithConnection,
    TServerLogger,
} from "mcos/shared";

/**
 * @private
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerLogger} log
 * @return {Promise<TMessageArrayWithConnection>}}
 */
export async function _npsHeartbeat(
    dataConnection: TBufferWithConnection,
    log: TServerLogger
): Promise<TMessageArrayWithConnection> {
    const packetContent = Buffer.alloc(8);
    const packetResult = new NPSMessage("sent");
    packetResult.msgNo = 0x1_27;
    packetResult.setContent(packetContent);
    packetResult.dumpPacket();
    return {
        connection: dataConnection.connection,
        messages: [packetResult],
        log,
    };
}
