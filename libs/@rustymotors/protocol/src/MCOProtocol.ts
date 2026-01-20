import { Socket } from "node:net";
import { BytableMessage, createRawMessage } from "@rustymotors/binary";
import { getServerLogger, ServerLogger } from "@rustymotors/logging";
import { serverLoginMessageHandler } from "./serverLoginMessageHandler.js";
import { writePacket } from "./writePacket.js";
import { defaultMessageHandler } from "./defaultMessageHandler.js";

/**
 * An array of message handler objects, each containing an operation code, a name, and a handler function.
 *
 * Each handler function processes a message and returns a promise that resolves to an object containing
 * the connection ID and the processed message (or null if no message is returned).
 *
 * @type {Array<{ opCode: number; name: string; handler: (args: { connectionId: string; message: BytableMessage; log: ServerLogger; }) => Promise<{ connectionId: string; message: BytableMessage | null; }> }>}
 */
const messageHandlers: {
	opCode: number;
	name: string;
	handler: (args: {
		connectionId: string;
		message: BytableMessage;
		log?: ServerLogger;
	}) => Promise<{
		connectionId: string;
		message: BytableMessage | null;
	}>;
}[] = [];

class MCOProtocol {
	private connections: Map<string, { socket: Socket; port: number }> =
		new Map();

	constructor() {
		messageHandlers.push({
			opCode: 0x501,
			name: "server login",
			handler: serverLoginMessageHandler,
		});
		messageHandlers.push({
			opCode: 0x532,
			name: "get personas",
			handler: defaultMessageHandler,
		});
	}

	getConnection(connectionId: string) {
		return this.connections.get(connectionId);
	}

	acceptIncomingSocket({
		connectionId,
		port,
		socket,
		log = getServerLogger("MCOProtocol/acceptIncomingSocket"),
	}: {
		connectionId: string;
		port: number;
		socket: Socket;
		log?: ServerLogger;
	}) {
		log.debug(
            "Accepting incoming socket",
            { connectionId, port }, 
        );
		this.connections.set(connectionId, { socket, port });
		socket.on("data", (data) => {
			this.receivePacket({ connectionId, data });
		});
		socket.on("close", () => {
			this.connections.delete(connectionId);
		});
		socket.on("error", (error: NodeJS.ErrnoException) => {
			if (error.code === "ECONNRESET") {
				log.verbose(
                    "Connection reset by client",
                    { connectionId }, 
                );
			} else {
				log.error(
                    `Socket error: ${error}`,
                    { connectionId }, 
                );
			}
		});
	}

	receivePacket({
		connectionId,
		data,
		log = getServerLogger("MCOProtocol/receivePacket"),
	}: {
		connectionId: string;
		data: Buffer;
		log?: ServerLogger;
	}) {
		const incomingPacket = createRawMessage(data);
		log.debug(
			`Received packet: ${incomingPacket.serialize().toString("hex")}`,
			{ connectionId },
		);

		const opCode = incomingPacket.header.messageId;
		const handler = messageHandlers.find(
			(handler) => handler.opCode === opCode,
		);
		if (handler) {
			handler
				.handler({ connectionId, message: incomingPacket })
				.then(({ connectionId, message }) => {
					if (message) {
						writePacket({ connectionId, data: message.serialize() });
					}
				});
		} else {
			log.warn(
                "No handler found for message",
                { connectionId, opCode }, 
            );
		}

		log.debug(
            "Packet processed",
            { connectionId }, 
        );
	}
}

let instance: MCOProtocol | null = null;

/**
 * Returns a singleton instance of the MCOProtocol class.
 * If the instance does not already exist, it creates a new one.
 *
 * @returns {MCOProtocol} The singleton instance of the MCOProtocol class.
 */
export function getMCOProtocolInstance() {
	if (!instance) {
		instance = new MCOProtocol();
	}
	return instance;
}