import { BytableMessage } from "@rustymotors/binary";
import { getRoomServerById } from "rusty-motors-database";
import {
	getServerLogger,
	ServerLogger,
} from "rusty-motors-shared";

const DEFAULT_RIFF = {
	name: "MCC01",
	ip: "71.186.155.248\n",
	port: 7003,
}

export async function handleGetServerInfo({
	connectionId,
	message,
	log = getServerLogger("lobby.handleGetServerInfo"),
}: {
	connectionId: string;
	message: BytableMessage;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	message: BytableMessage;
}> {
	try {
		log.debug(`[${connectionId}] Handling NPS_GET_SERVER_INFO`);
		log.debug(
			`[${connectionId}] Received command: ${message.serialize().toString("hex")}`,
		);

		// l
		const incommingRequest = new BytableMessage();
		incommingRequest.setSerializeOrder([{ name: "riffId", field: "Dword" }]);
		incommingRequest.deserialize(message.serialize());

		const requestRiffId = incommingRequest.getFieldValueByName("riffId");

		if (typeof requestRiffId !== "number") {
			log.error({
				connectionId,
				requestRiffId,
			}, `Invalid riffId: ${requestRiffId}`);
			return {
				connectionId,
				message: new BytableMessage(),
			};
		}

		log.debug(
			`[${connectionId}] Received riffId: ${requestRiffId}`,
		);

		let riff = getRoomServerById(requestRiffId) || DEFAULT_RIFF;

		if (riff === DEFAULT_RIFF) {
			log.warn(
				`[${connectionId}] Riff not found, using default riff: ${riff.name}`,
			);
		}


		// TODO: Actually have servers

		// plplll
		const outgoingGameMessage = new BytableMessage();
		outgoingGameMessage.setSerializeOrder([
			{ name: "riffName", field: "String" },
			{ name: "commId", field: "Dword" },
			{ name: "ipAddress", field: "String" },
			{ name: "port", field: "Dword" },
			{ name: "userId", field: "Dword" },
			{ name: "playerCount", field: "Dword" },
		]);

		outgoingGameMessage.header.setMessageId(525);
        outgoingGameMessage.setVersion(0);
		outgoingGameMessage.setFieldValueByName("riffName", riff.name);
		outgoingGameMessage.setFieldValueByName("commId", 224);
		outgoingGameMessage.setFieldValueByName(
			"ipAddress",
			"71.186.155.248\n",
		);
		outgoingGameMessage.setFieldValueByName(
			"port",
			riff.port
		);
		outgoingGameMessage.setFieldValueByName("userId", 21);
		outgoingGameMessage.setFieldValueByName("playerCount", 1);

		log.debug(
			`[${connectionId}] Sending response[string]: ${outgoingGameMessage.toString()}`,
		);
		log.debug(
			`[${connectionId}] Sending response[serialize1]: ${outgoingGameMessage.serialize().toString("hex")}`,
		);

		// Build the packet
		const packetResult = new BytableMessage();
		packetResult.setSerializeOrder([
			{ name: "data", field: "Buffer" },
		]);
		packetResult.setVersion(0);
		packetResult.deserialize(outgoingGameMessage.serialize());

		log.debug(
			`[${connectionId}] Sending response[serialize2]: ${packetResult.serialize().toString("hex")}`,
		);

		return {
			connectionId,
			message: packetResult,
		};
	} catch (error) {
		const err = Error(
			`[${connectionId}] Error handling NPS_GET_SERVER_INFO: ${String(error)}`,
		);
		err.cause = error;
		throw err;
	}
}
