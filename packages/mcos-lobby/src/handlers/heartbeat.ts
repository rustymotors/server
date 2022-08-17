import type { Connection } from "@prisma/client";
import { logger } from "mcos-logger";
import { NPSMessage } from "../NPSMessage.js";

const log = logger.child({ service: "mcos:lobby" });

/**
 * @private
 * @param {Connection} _connection
 * @param {Buffer} data
 * @return {NPSMessage}}
 */
export async function _npsHeartbeat({
    traceId,
    connection,
}: {
    traceId: string;
    connection: Connection;
    data: Buffer;
}): Promise<NPSMessage> {
    log.raw({
        level: "debug",
        message: "Received heatbeat",
        otherKeys: {
            function: "_npsHeartbeat",
            connectionId: connection.id,
            traceId,
        },
    });
    const packetContent = Buffer.alloc(8);
    const packetResult = new NPSMessage("sent");
    packetResult.msgNo = 0x1_27;
    packetResult.setContent(packetContent);
    packetResult.dumpPacket();
    return packetResult;
}
