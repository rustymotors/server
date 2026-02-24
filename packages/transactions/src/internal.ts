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

import { getServerLogger, type MessageNode, type ServerLogger } from "rusty-motors-shared";
import * as Sentry from "@sentry/node"

import type {
	McosEncryption,
	State,
} from "rusty-motors-shared";
import { BytableBuffer } from "@rustymotors/binary";
import {
	fetchStateFromDatabase,
	getEncryption,
	updateEncryption,
} from "rusty-motors-shared";
import { OldServerMessage } from "rusty-motors-shared";
import { type MessageHandlerResult, _MSG_STRING } from "./handlers.js";
import { getTransactionsHandlerRegistry } from "./handlers/registry.js";
import {
	ServerPacket,
	type BufferSerializer,
} from "rusty-motors-protocol";
import { explode } from "pklib-ts"



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
	inboundMessage: ServerPacket;
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
		// Turn this into an OldServerMessage for compatibility
		const packet = new OldServerMessage();
		packet._doDeserialize(inboundMessage.serialize());

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

	throw Error(
		`[${connectionId}] UNSUPPORTED_MESSAGECODE:: ${currentMessageNo} (${currentMessageString})`,
	);
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

	let decryptedMessage: ServerPacket;

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

	let decompressedMessage: ServerPacket;

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
	const outboundMessages: ServerPacket[] = [];

	response.messages.forEach((message) => {
		const outboundMessage = new ServerPacket();
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
	unencryptedMessage: ServerPacket,
	state: State,
	connectionId: string,
	log = getServerLogger("transactionServer.encryptOutboundMessage"),
): ServerPacket {
	try {
		const encryptedMessage = encryptionSettings.dataEncryption.encrypt(
			unencryptedMessage.data.serialize(),
		);
		updateEncryption(state, encryptionSettings).save();

		// Verify the length of the message
		verifyLength(unencryptedMessage.data.serialize(), encryptedMessage);

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
	compressedMessage: ServerPacket,
	_connectionId: string,
	log = getServerLogger("transactionServer.decompressInboundMessage"),
): ServerPacket {
	log.debug(`Decompressing message with initial messageId of ${compressedMessage.getMessageId()}`)

	const outputBuffer = new Uint8Array(64 * 1024); // 64KB buffer
	let outputPos = 0;

	const compressedPayload = compressedMessage.getDataBuffer().subarray(2)

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

		// Output raw binary data to stdout
		const uncompressedMessage = ServerPacket.copy(compressedMessage, outputData);
		uncompressedMessage.setPayloadCompression(false)
		return uncompressedMessage
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
