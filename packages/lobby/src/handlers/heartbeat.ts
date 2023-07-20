import { NPSMessage } from "@mcos/shared";
import { ServiceArgs, ServiceResponse } from "@mcos/interfaces";

/**
 * @private
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerLogger} log
 * @return {Promise<TMessageArrayWithConnection>}}
 */
export async function _npsHeartbeat(
    args: ServiceArgs
): Promise<ServiceResponse> {
    const { legacyConnection: dataConnection, log } = args;
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
