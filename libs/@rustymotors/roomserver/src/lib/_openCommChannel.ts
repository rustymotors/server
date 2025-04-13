import { BytableMessage } from "@rustymotors/binary";
import { getServerLogger, LegacyMessage, type ServerLogger } from "rusty-motors-shared";
import { CommData } from "./OpenCommChannelRequest.js";

export async function _handleCommChannelOpen({
	connectionId,
	message,
	log = getServerLogger("lobby._openCommChannel"),
}: {
	connectionId: string;
	message: BytableMessage;
	log?: ServerLogger;
}) {
	log.debug(
		{ connectionId, message: message.toHexString() },
		"Handling NPS_OPEN_COMM_CHANNEL",
	);

	const request = new CommData();
	request.deserialize(message.getBody());

    const requestedCommId = 2;
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
