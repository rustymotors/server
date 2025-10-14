import {
	GamePacket,
	type SerializableInterface,
} from 'rusty-motors-shared-packets';
import { receiveLobbyData } from 'rusty-motors-lobby';
import { receivePersonaData } from 'rusty-motors-personas';
import { receiveLoginData } from 'rusty-motors-login';
import {receiveChatData} from "rusty-motors-chat"
import { BytableMessage, createRawMessage } from '@rustymotors/binary';
import * as Sentry from '@sentry/node';
import { getServerLogger, messageQueueItem, ServerLogger, TaggedSocket, MessageQueue, getSocketQueue, addSocketPair } from 'rusty-motors-shared';

/**
 * Handles routing for the NPS (Network Play System) ports.
 *
 * @param taggedSocket - The socket connection with associated metadata to be routed.
 *
 * @remark If the socket's local port is undefined, the connection is closed immediately. On port 7003, an "ok to login" packet is sent upon connection.
 */

export async function npsPortRouter({
	taggedSocket,
	log = getServerLogger("gateway.npsPortRouter"),
}: {
	taggedSocket: TaggedSocket;
	log?: ServerLogger;
}): Promise<void> {
	const { socket: socket, connectionId: id, localPort } = taggedSocket;

	const port = localPort;

	const receiveQueue = new MessageQueue("npsIn", 10, async (item: messageQueueItem) => {
		try {
			await processSocketData(item.data, log, taggedSocket.connectionId, taggedSocket.localPort, taggedSocket)
		} catch (err) {
			console.error(`Error receiving item: ${err}`)
		}
	})

	const sendQueue = new MessageQueue(
        'npsOut',
        10,
        async (item: messageQueueItem) => {
            try {
                socket.write(item.data)
            } catch (err) {
                console.error(`Error sending item: ${err}`);
            }
        },
    );

    addSocketPair(id, {
        send: sendQueue,
        receive: receiveQueue
    })


	// TODO: Document this
	if (port === 7003) {
		// Sent ok to login packet
		log.debug(`[${id}] Sending ok to login packet`);
		socket.write(Buffer.from([0x02, 0x30, 0x00, 0x04]));
	}

	// Handle the socket connection here
	socket.on('data', async (data) => {
		receiveQueue.put({
			sequenceNo: -1,
			data
		});
	})

	socket.on('end', () => {
		receiveQueue.exit()
	});

	socket.on("error", (error) => {
		if (error.message.includes("ECONNRESET")) {
			log.debug(`[${id}] Connection reset by client`);
			return;
		}
		log.error(`[${id}] Socket error: ${error}`);
        receiveQueue.exit();
	});
}

/**
 * The function `isPacketValid` checks if a packet of data is valid based on specific conditions
 * related to the message code within the data buffer.
 * @param {Buffer} data - A Buffer containing data to be checked for validity.
 * @returns The function `isPacketValid` returns a boolean value. If the conditions for the packet data
 * being valid are met, it returns `true`. Otherwise, if the data length is less than 4 or the message
 * code falls within certain ranges that indicate it is invalid, it returns `false`.
 */
function isPacketValid(data: Buffer): boolean {
    if (data.length < 4) {
        return false;
    }

    // Read the message code from the start of the buffer
    const msgCode = data.readUInt16BE();

    if (
        msgCode > 0x1301 ||
        msgCode < 0x100 ||
        (msgCode >= 0x902 && msgCode <= 0x1000)
    ) {
        // we know this is junk, toss it
        return false;
    }
    return true;
}

/**
 * Processes incoming socket data, splits it into packets if necessary, and routes
 * the initial message for further handling. Sends the response back to the client
 * through the socket.
 *
 * @param log - The logger instance used for logging debug, warning, and error messages.
 * @param id - A unique identifier for the current connection or session.
 * @param port - The port number associated with the socket connection.
 * @param socket - The socket instance used for communication with the client.
 * @returns A function that processes incoming data buffers from the socket.
 *
 * The returned function:
 * - Logs the received data and its length.
 * - Splits the data into packets based on a predefined separator if multiple packets are detected.
 * - Parses the initial message from each packet.
 * - Routes the initial message and sends the response back to the client.
 * - Handles errors during parsing, routing, or response sending, logging them appropriately.
 */
async function processSocketData(
	data: Buffer<ArrayBufferLike>,
	log: ServerLogger,
	id: string,
	port: number,
	socket: TaggedSocket,
): Promise<void> {
	// Early tossing of known bad packets
    if (!isPacketValid(data)) {
        socket.socket.end();
        return;
	}


	try {
		log.debug(`[${id}] Received data: ${data.toString('hex')}`);
		log.debug(`[${id}] Data length: ${data.length}`);

		const separator = Buffer.from([0x11, 0x01]);
		const packets = splitDataIntoPackets(data, separator, log, id);

		for (const packet of packets) {
			log.debug(`raw packet: ${packet.toString("hex")}`)
			if (packet.byteLength === 0) {
				log.warn(`BUG: We recieved an empty packet from the splitter`)
				continue
			}
			const initialPacket = parseInitialMessage(packet);
			handlePacketRouting(id, port, initialPacket);
		}
	} catch (error) {
		handleSocketError(error, log, id);
	}

}

/**
 * The function `splitDataIntoPackets` takes a data buffer, separator buffer, server logger, and ID
 * string, splits the data into packets based on the separator, and returns an array of buffers
 * representing the packets.
 * @param {Buffer} data - The `data` parameter is a Buffer containing the data that needs to be split
 * into packets.
 * @param {Buffer} separator - The `separator` parameter is a Buffer that is used to split the `data`
 * Buffer into separate packets. It is used to identify the boundaries between packets in the data.
 * @param {ServerLogger} log - The `log` parameter in the `splitDataIntoPackets` function is a
 * `ServerLogger` object that is used for logging debug messages. It is used to log information about
 * the packets being processed and split during the execution of the function.
 * @param {string} id - The `id` parameter in the `splitDataIntoPackets` function is a string that
 * represents an identifier for the data packets being processed. It is used for logging purposes to
 * track and identify the packets as they are split and processed.
 * @returns The function `splitDataIntoPackets` returns an array of Buffers containing the split data
 * packets.
 */
function splitDataIntoPackets(
	data: Buffer,
	separator: Buffer,
	log: ServerLogger,
	id: string,
): Buffer[] {
	const packetsArray = data.toString('hex').split(separator.toString('hex'))
	const packetCount =
		packetsArray.length;
	let packets: Buffer[];
	log.debug(`[${id}] ${packetCount} packets detected`);

	if (packetCount > 1) {
		packets = packetsArray.map((packet: string) => {
			if (packet.length > 0) {
				return Buffer.concat([Buffer.from([0x11, 0x01]), Buffer.from(packet, "hex")])
			}
			return Buffer.alloc(0)
		})
		packets = removeEmptyEntries(packets);
		log.debug(
			`[${id}] Split packets: ${packets.map((p) => p.toString('hex'))}`,
		);
	} else {
		packets = packetsArray.map((packet: string) => {
			return Buffer.from(packet, "hex")
		})
	}
	return packets;

	function removeEmptyEntries(packets: Buffer<ArrayBufferLike>[]) {
		packets = packets.filter((packet: Buffer | undefined) => {
			return packet && packet.byteLength > 2;
		});
		return packets;
	}
}

/**
 * This TypeScript function handles packet routing by routing an initial message and sending a response
 * through a socket while logging any errors.
 * @param {string} id - The `id` parameter is a string representing the unique identifier of the packet
 * being handled.
 * @param {number} port - The `port` parameter in the `handlePacketRouting` function is the port number
 * on which the initial packet is received. It is used to help route the initial message to the correct
 * destination based on the port number.
 * @param {BytableMessage} initialPacket - The `initialPacket` parameter in the `handlePacketRouting`
 * function is of type `BytableMessage`. It likely represents the initial packet of data that needs to
 * be routed based on the provided `id` and `port`.
 * @param {TaggedSocket} socket - The `socket` parameter in the `handlePacketRouting` function
 * represents a tagged socket that is used for communication. It likely includes information such as
 * the socket connection, address, and other relevant details for sending and receiving data over the
 * network.
 * @param {ServerLogger} log - The `log` parameter in the `handlePacketRouting` function is a
 * `ServerLogger` object used for logging messages and debugging information related to the packet
 * routing process. It is likely used to log events, errors, and other relevant information during the
 * execution of the function.
 */
async function handlePacketRouting(
	id: string,
	port: number,
	initialPacket: BytableMessage,
): Promise<void> {
	try {
		routeInitialMessage(id, port, initialPacket);
	} catch (error) {
		throw new Error(`[${id}] Error routing initial nps message`, {
			cause: error,
		});
	}
}

function handleSocketError(error: unknown, log: ServerLogger, id: string): void {
	if (error instanceof RangeError) {
		log.warn(`[${id}] Error parsing initial nps message: ${error}`);
	} else {
		Sentry.captureException(error);
		log.error(`[${id}] Error handling data: ${error}`);
	}
}

/**
 * Parses a raw buffer into a `BytableMessage` representing the initial game packet.
 *
 * Sets the message version based on the packet ID, then deserializes the buffer into a message object.
 *
 * @param data - The buffer containing the raw initial message.
 * @returns The parsed `BytableMessage` object.
 *
 * @throws {Error} If the buffer cannot be parsed into a valid message.
 */
function parseInitialMessage(data: Buffer): BytableMessage {
	try {
		const message = createRawMessage();
		message.setVersion(1);

		// There are a few messages here that need special handling due to length
		const id = data.readUInt16BE(0);
		if ([0x217, 0x532].includes(id)) {
			message.setVersion(0);
		}

		message.deserialize(data);

		return message;
	} catch (error) {
		const err = new Error(`Error parsing initial message: ${error}`, {
			cause: error,
		});
		getServerLogger("gateway.npsPortRouter/parseInitialMessage").error(
			(err as Error).message,
		);
		throw err;
	}
}

/**
 * Routes the initial message to the appropriate handler based on the port number.
 * Handles different types of packets such as lobby data, login data, chat data, and persona data.
 * Logs the routing process and the number of responses sent back to the client.
 *
 * @param id - The connection ID of the client.
 * @param port - The port number to determine the type of packet.
 * @param initialPacket - The initial packet received from the client.
 * @param log - The logger to use for logging messages.
 * @returns A promise that resolves to a Buffer containing the serialized responses.
 */
async function routeInitialMessage(
	id: string,
	port: number,
	initialPacket: BytableMessage,
	log = getServerLogger("gateway.npsPortRouter/routeInitialMessage"),
): Promise<void> {
	// Route the initial message to the appropriate handler
	// Messages may be encrypted, this will be handled by the handler

	log.debug(`Routing message for port ${port}: ${initialPacket.header.messageId}`);

	const packet = new GamePacket();
	packet.deserialize(initialPacket.serialize());

	let responses: SerializableInterface[] = [];

	let wasHandled = false

	if (port > 9000 && port < 9021) {
		log.debug(
			`[${id}] Passing room packet to lobby handler: ${packet.getMessageId()}`,
		);
		responses = (
			await receiveLobbyData({ connectionId: id, message: initialPacket })
		).messages;
		log.debug(`[${id}] Received ${responses.length} room lobby response packets`);
		wasHandled = true
	}

	switch (port) {
		case 7003:
			// Handle lobby packet
			log.debug(
				`[${id}] Passing packet to lobby handler: ${packet.getMessageId()}`,
			);
			responses = (
				await receiveLobbyData({ connectionId: id, message: initialPacket })
			).messages;
			log.debug(`[${id}] Received ${responses.length} lobby response packets`);
			wasHandled = true
			break;
		case 8226:
			// Handle login packet
			responses = (
				await receiveLoginData({ connectionId: id, message: initialPacket })
			).messages;
			log.debug(`[${id}] Received ${responses.length} login response packets`);
			wasHandled = true
			break;
		case 8227:
			// Handle chat packet
			log.debug(
				`[${id}] Passing packet to chat handler: ${packet.serialize().toString("hex")}`,
			);
			responses = (await receiveChatData({ connectionId: id, message: packet }))
				.messages;
			log.debug(`[${id}] Chat Responses: ${responses.map((r) => r.serialize().toString("hex"))}`);
			break;
		case 8228:
			log.debug(
				`[${id}] Passing packet to persona handler: ${packet.serialize().toString("hex")}`,
			);
			// responses =Handle persona packet
			responses = (
				await receivePersonaData({ connectionId: id, message: packet })
			).messages;
			log.debug(`[${id}] Received ${responses.length} persona response packets`);
			wasHandled = true
			break;
		case 10001:
			log.debug(
				`[${id}] Passing race? packet to lobby handler: ${packet.getMessageId()}`,
			);
			responses = (
				await receiveLobbyData({ connectionId: id, message: initialPacket })
			).messages;
			log.debug(`[${id}] Received ${responses.length} race? lobby response packets`);
			wasHandled = true
			break;

		default:
			// No handler
			if (wasHandled === false) {

				log.warn(
					`${id}] No handler found for port ${port}: ${packet.serialize().toString("hex")}`,
				);
			}
			break;
	}

	// Send responses back to the client
	log.debug(`[${id}] Sending ${responses.length} responses`);

    const sendQueue = getSocketQueue(id, "send")

	// Serialize the responses
	responses.forEach((response) => sendQueue.put({
        sequenceNo: -1,
        data: response.serialize(),
    }));
}