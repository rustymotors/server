import { BytableMessage, Uint16_t } from "@rustymotors/binary";
import { getServerLogger, LegacyMessage, type ServerLogger } from "rusty-motors-shared";

export async function _handleGetUserList({
    connectionId,
    message,
    log = getServerLogger("lobby._getUserList"),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}) {
    log.debug(
        { connectionId, message: message.toHexString() },
        "Handling NPS_GET_USER_LIST",
    );

    // 0101000800000002

    const requestPayload = new Uint16_t();
    requestPayload.deserialize(message.getBody());

    const requestedCommId = requestPayload.getBE();
    
    log.debug(
        { connectionId, requestedCommId },
        "Requested Comm ID",
    );

    const serverPort = 9001;

    const channelGrantedData = Buffer.alloc(8);
    channelGrantedData.writeUInt32BE(requestedCommId, 0); // commId
    channelGrantedData.writeUInt32BE(serverPort, 4); // userCount

    const response = new LegacyMessage();
    response.setMessageId(0x214); // COMM_GRANTED
    response.setBuffer(channelGrantedData);
    const packetResult = new BytableMessage();
    packetResult.setSerializeOrder([
        { name: "data", field: "Buffer" },
    ]);
    packetResult.deserialize(response.serialize());
    log.debug({
        connectionId,
        packetResult: packetResult.toHexString(),
    },
        "COMM_GRANTED",
    );

    return {
        connectionId,
        message: packetResult,
    };
}
