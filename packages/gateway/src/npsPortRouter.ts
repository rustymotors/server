import { getServerLogger, type ServerLogger } from "rusty-motors-shared";
import type { TaggedSocket } from "./socketUtility.js";
import {
	GamePacket,
	type SerializableInterface,
} from "rusty-motors-shared-packets";
import { receiveLobbyData } from "rusty-motors-lobby";
import { receiveChatData } from "rusty-motors-chat";
import { receivePersonaData } from "rusty-motors-personas";
import { receiveLoginData } from "rusty-motors-login";

/**
 * Handles routing for the NPS (Network Play System) ports.
 *
 * @param taggedSocket - The socket that has been tagged with additional metadata.
 */

export async function npsPortRouter({
	taggedSocket,
	log = getServerLogger({
		name: "gatewayServer.npsPortRouter",
	}),
}: {
	taggedSocket: TaggedSocket;
	log?: ServerLogger;
}): Promise<void> {
	const { socket, id } = taggedSocket;

	const port = socket.localPort || 0;

	if (port === 0) {
		log.error(`[${id}] Local port is undefined`);
		socket.end();
		return;
	}
	log.debug(`[${taggedSocket.id}] NPS port router started for port ${port}`);

		if (port === 7003) {
		// Sent ok to login packet
		log.debug(`[${id}] Sending ok to login packet`);
		taggedSocket.socket.write(Buffer.from([0x02, 0x30, 0x00, 0x00]));
	}

	// Handle the socket connection here
	socket.on("data", (data) => {
		log.debug(`[${id}] Received data: ${data.toString("hex")}`);
		const initialPacket = parseInitialMessage(data);
		log.debug(`[${id}] Initial packet(str): ${initialPacket}`);
		log.debug(`[${id}] initial Packet(hex): ${initialPacket.toHexString()}`);
		routeInitialMessage(id, port, initialPacket)
			.then((response) => {
				// Send the response back to the client
				log.debug(`[${id}] Sending response: ${response.toString("hex")}`);
				socket.write(response);
			})
			.catch((error) => {
				log.error(`[${id}] Error routing initial message: ${error}`);
			});
	});

	socket.on("end", () => {
		log.debug(`[${id}] Socket closed`);
	});

	socket.on("error", (error) => {
		log.error(`[${id}] Socket error: ${error}`);
	});
}

function parseInitialMessage(data: Buffer): GamePacket {
	const initialPacket = new GamePacket();
	initialPacket.deserialize(data);
	return initialPacket;
}

async function routeInitialMessage(
	id: string,
	port: number,
	initialPacket: GamePacket,
	log = getServerLogger({ name: "gatewayServer.routeInitialMessage" }),
): Promise<Buffer> {
	// Route the initial message to the appropriate handler
	// Messages may be encrypted, this will be handled by the handler

	console.log(
		`Routing message for port ${port}: ${initialPacket.toHexString()}`,
	);
	let responses: SerializableInterface[] = [];

	switch (port) {
		case 7003:
			responses = (
				await receiveLobbyData({ connectionId: id, message: initialPacket })
			).messages;
			break;
		case 8226:
			// Handle login packet
			responses = (
				await receiveLoginData({ connectionId: id, message: initialPacket })
			).messages;
			break;
		case 8227:
			// Handle chat packet
			responses = (
				await receiveChatData({ connectionId: id, message: initialPacket })
			).messages;
			break;
		case 8228:
			// responses =Handle persona packet
			responses = (
				await receivePersonaData({ connectionId: id, message: initialPacket })
			).messages;
			break;
		default:
			console.log(`No handler found for port ${port}`);
			break;
	}

	// Send responses back to the client
	log.debug(`[${id}] Sending ${responses.length} responses`);

	// Serialize the responses
	const serializedResponses = responses.map((response) => response.serialize());

	return Buffer.concat(serializedResponses);
}
