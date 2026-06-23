// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { getServerLogger, type ServerLogger } from "rusty-motors-shared";
import * as Sentry from "@sentry/node"

import type {
	McosEncryption,
	State,
} from "rusty-motors-shared";
import { BytableBuffer } from "@rustymotors/binary";
import {
	fetchStateFromDatabase,
	getEncryption,
	MessageNode,
	updateEncryption,
} from "rusty-motors-shared";
import { type MessageHandlerResult, _MSG_STRING } from "./types.js";
import { getTransactionsHandlerRegistry } from "./handlers/registry.js";
import { explode } from "pklib-ts"



/**
 * Thrown by {@link processInput} when an MCOTS message passes the header
 * check and decryption but no handler is registered for its opcode.
 *
 * Carries the numeric `messageCode` so upstream catch sites can recognize
 * the case (e.g. to avoid double-reporting to Sentry — `processInput` already
 * captures positive codes itself).
 */
export class UnsupportedMessageCodeError extends Error {
	readonly messageCode: number;
	readonly messageName: string;
	readonly connectionId: string;

	constructor(connectionId: string, messageCode: number, messageName: string) {
		super(
			`[${connectionId}] UNSUPPORTED_MESSAGECODE:: ${messageCode} (${messageName})`,
		);
		this.name = "UnsupportedMessageCodeError";
		this.messageCode = messageCode;
		this.messageName = messageName;
		this.connectionId = connectionId;
	}
}

/**
 * Route or process MCOTS commands
 * @param {MessageHandlerArgs} args
 * @returns {Promise<MessageHandlerResult>}
 */
async function processInput({
	connectionId,
	inboundMessage,
	log = getServerLogger("transactionServer.processInput"),
}: {
	connectionId: string;
	inboundMessage: MessageNode;
	log?: ServerLogger;
}): Promise<MessageHandlerResult> {
	const currentMessageNo = inboundMessage.getMessageId();
	const currentMessageString = _MSG_STRING(currentMessageNo); // For logging only

	log.debug(
		`[${connectionId}] Processing message: ${currentMessageNo} (${currentMessageString}), sequence: ${inboundMessage.getSequence()}`,
	);

	// Use the handler registry to find the appropriate handler
	const registry = getTransactionsHandlerRegistry();
	const handlerEntry = registry.getHandler(currentMessageNo);

	if (handlerEntry) {
		const packet = new MessageNode();
		packet.deserialize(inboundMessage.serialize());

		try {
			const responsePackets = await handlerEntry.handler({
				connectionId,
				packet,
			});
			return responsePackets;
		} catch (error) {
			const err = Error(`[${connectionId}] Error processing message ${error}`, {
				cause: error,
			});
			throw err;
		}
	}

	const err = new UnsupportedMessageCodeError(
		connectionId,
		currentMessageNo,
		currentMessageString,
	);

	// Surface real-looking unknown opcodes to Sentry so we can prioritize the
	// ones clients are actually sending. Filter out non-positive codes — those
	// almost always come from corrupt/garbage buffer reads (signed int16
	// returning a negative or zero value), not real protocol traffic.
	if (currentMessageNo > 0) {
		const body = inboundMessage.getBody().serialize();
		const decryptedHex = body.toString("hex");
		Sentry.captureException(err, {
			tags: {
				messageCode: String(currentMessageNo),
				messageName: currentMessageString,
				errorType: "UnsupportedMessageCode",
			},
			extra: {
				connectionId,
				sequence: inboundMessage.getSequence(),
				bodyByteLength: body.byteLength,
				decryptedHex,
			},
		});
	}

	throw err;
}

/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {MessageNode} args.message
 * @param {ServerLogger} [args.log=getServerLogger({ name: "transactionServer" })]
 * @returns {Promise<{
 *     connectionId: string,
 *    messages: BytableBuffer[]
 * }>}
 */
export async function receiveTransactionsData({
	connectionId,
	message,
	log = getServerLogger("transactionServer.receiveTransactionsData"),
}: {
	connectionId: string;
	message: MessageNode;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	messages: BytableBuffer[];
}> {

	// Normalize the message

	const inboundMessage = message;

	log.verbose(
		`Received message`, {
            namespace: "receiveTransactionsData",
            connectionId,
            data: message.serialize().toString("hex")
        },
	);

	let decryptedMessage: MessageNode;

	// Is the message encrypted?
	if (inboundMessage.isPayloadEncrypted()) {
		// Get the encryyption settings for this connection
		const state = fetchStateFromDatabase();

		const encryptionSettings = getEncryption(state, connectionId);

		if (typeof encryptionSettings === "undefined") {
			throw Error(`[${connectionId}] Unable to locate encryption settings`);
		}

		// log the old buffer
		log.debug(
			`[${connectionId}] Inbound buffer: ${inboundMessage.getBody().toString()}`,
		);

		decryptedMessage = decryptMessage(
			encryptionSettings,
			inboundMessage,
			state,
			connectionId,
		);
	} else {
		decryptedMessage = inboundMessage;
	}

	let decompressedMessage: MessageNode;

	if (decryptedMessage.isPayloadCompressed()) {

		decompressedMessage = decompressMessage(
			decryptedMessage,
			connectionId,
		);
	} else {
		log.debug(`[${connectionId}] Message is not encrypted`);
		decompressedMessage = decryptedMessage;
	}

	// Process the message

	const response = await processInput({
		connectionId,
		inboundMessage: decompressedMessage,
		log,
	});

	// Loop through the outbound messages and encrypt them
	const outboundMessages: MessageNode[] = [];

	response.messages.forEach((message) => {
		const outboundMessage = new MessageNode();
		outboundMessage.deserialize(message.serialize());

		if (outboundMessage.isPayloadEncrypted()) {
			const state = fetchStateFromDatabase();

			const encryptionSettings = getEncryption(state, connectionId);

			if (typeof encryptionSettings === "undefined") {
				throw Error(`[${connectionId}] Unable to locate encryption settings`);
			}

			const encryptedMessage = encryptOutboundMessage(
				encryptionSettings,
				outboundMessage,
				state,
				connectionId,
			);
			outboundMessages.push(encryptedMessage);
		} else {
			log.debug(
				`[${connectionId}] Sending message: ${outboundMessage.getMessageId()}`,
			);
			outboundMessages.push(outboundMessage);
		}
	});

	log.debug(
		`[${connectionId}] Exiting transaction module with ${outboundMessages.length} messages`,
	);

	// Convert the outbound messages to BytableBuffer
	const outboundMessagesSerialized = outboundMessages.map((message) => {
		const serialized = new BytableBuffer();
		serialized.deserialize(message.serialize());
		return serialized;
	});

	return {
		connectionId,
		messages: outboundMessagesSerialized,
	};
}

/**
 * Decrypts an inbound message using the provided encryption settings and updates the state.
 *
 * @param encryptionSettings - The encryption settings to use for decryption.
 * @param inboundMessage - The message to be decrypted.
 * @param state - The current state of the server.
 * @param log - The logger to use for logging. Defaults to a logger named "transactionServer.decryptMessage".
 * @param connectionId - The ID of the connection associated with the message.
 * @returns The decrypted message as a `ServerPacket`.
 * @throws Will throw an error if the message cannot be decrypted.
 */
function decryptMessage(
	encryptionSettings: McosEncryption,
	inboundMessage: MessageNode,
	state: State,
	connectionId: string,
	log: ServerLogger = getServerLogger("transactionServer.decryptMessage"),
): MessageNode {
	try {
		const decryptedMessage = encryptionSettings.dataEncryption.decrypt(
			inboundMessage.getBody().serialize(),
		);
		updateEncryption(state, encryptionSettings).save();

		// Verify the length of the message
		verifyLength(inboundMessage.getBody().serialize(), decryptedMessage);

		// Assuming the message was decrypted successfully, update the buffer
		log.debug(
			`[${connectionId}] Decrypted buffer: ${decryptedMessage.toString("hex")}`,
		);

		const outboundMessage = inboundMessage
        outboundMessage.getBody().deserialize(decryptedMessage);
		outboundMessage.setPayloadEncryption(false);

		return outboundMessage;
	} catch (error) {
        log.error(`Unable to decrypt message: ${error}`, {
            connectionId,
            error
        });
        Sentry.captureException(error)
		const err = Error(`[${connectionId}] Unable to decrypt message`, {
			cause: error,
		});
		throw err;
	}
}

function encryptOutboundMessage(
	encryptionSettings: McosEncryption,
	unencryptedMessage: MessageNode,
	state: State,
	connectionId: string,
	log = getServerLogger("transactionServer.encryptOutboundMessage"),
): MessageNode {
	try {
		const encryptedMessage = encryptionSettings.dataEncryption.encrypt(
			unencryptedMessage.data,
		);
		updateEncryption(state, encryptionSettings).save();

		// Verify the length of the message
		verifyLength(unencryptedMessage.data, encryptedMessage);

		// Assuming the message was decrypted successfully, update the buffer
		log.debug(
			`[${connectionId}] Encrypted buffer: ${encryptedMessage.toString("hex")}`,
		);

		const outboundMessage =  unencryptedMessage
		outboundMessage.setDataBuffer(encryptedMessage)
		outboundMessage.setSignature("TOMC")
		outboundMessage.setPayloadEncryption(true);

		log.debug(
			`[${connectionId}] Encrypted message: ${outboundMessage.toHexString()}`,
		);

		return outboundMessage;
	} catch (error) {
		const err = Error(`[${connectionId}] Unable to encrypt message`, {
			cause: error,
		});
		throw err;
	}
}

function decompressMessage(
	compressedMessage: MessageNode,
	_connectionId: string,
	log = getServerLogger("transactionServer.decompressInboundMessage"),
): MessageNode {
	log.debug(`Decompressing message with initial messageId of ${compressedMessage.getMessageId()}`)

	const outputBuffer = new Uint8Array(64 * 1024); // 64KB buffer
	let outputPos = 0;

	const compressedPayload = compressedMessage.data.subarray(2)

	const writeCallback = (data: Uint8Array, bytesToWrite: number): number => {
		if (outputPos + bytesToWrite > outputBuffer.length) {
			throw new Error('Output buffer overflow');
		}
		outputBuffer.set(data.slice(0, bytesToWrite), outputPos);
		outputPos += bytesToWrite;
		return bytesToWrite;
	};

	let inputPos = 0;
	const readCallback = (buffer: Uint8Array, bytesToRead: number): number => {
		const available = Math.min(bytesToRead, compressedPayload.length - inputPos);
		if (available <= 0) return 0;

		buffer.set(compressedPayload.subarray(inputPos, inputPos + available));
		inputPos += available;
		return available;
	};

	const result = explode(readCallback, writeCallback);

	if (result.success) {
		const outputData = Buffer.from(outputBuffer.slice(0, outputPos));

		log.debug(`DecompressedPayload: ${outputData.toString("hex")}`)

		compressedMessage.setDataBuffer(outputData);
		compressedMessage.setPayloadCompression(false);
		return compressedMessage;
	} else {
		log.error(`returned data len: ${result.decompressedData?.length}`)

		throw new Error(result.errorCode.valueOf().toString() ?? 'Oh no!')
	}


}

/**
 * @param {Buffer} buffer
 * @param {Buffer} buffer2
 */
export function verifyLength(buffer: Buffer, buffer2: Buffer) {
	if (buffer.length !== buffer2.length) {
		throw Error(`Length mismatch: ${buffer.length} !== ${buffer2.length}`);
	}
}
