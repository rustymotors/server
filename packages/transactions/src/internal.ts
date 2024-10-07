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

import { getServerConfiguration, type ServerLogger } from "rusty-motors-shared";
import {
	fetchStateFromDatabase,
	getEncryption,
	updateEncryption,
} from "rusty-motors-shared";
import { getServerLogger } from "rusty-motors-shared";
import { OldServerMessage } from "rusty-motors-shared";
import { SerializedBufferOld } from "rusty-motors-shared";
import { ServerMessage } from "rusty-motors-shared";
import { messageHandlers } from "./handlers.js";
import type { BufferSerializer } from "rusty-motors-shared-packets";
import { _MSG_STRING } from "./_MSG_STRING.js";

/**
 *
 *
 * @param {ServerMessage} message
 * @return {boolean}
 */
function isMessageEncrypted(
	message: OldServerMessage | ServerMessage,
): boolean {
	return message._header.flags - 8 >= 0;
}

/**
 * Route or process MCOTS commands
 * @param {import("./handlers.js").MessageHandlerArgs} args
 * @returns {Promise<import("./handlers.js").MessageHandlerResult>}
 */
async function processInput({
	connectionId,
	packet,
	log = getServerLogger({
		name: "transactionServer",
	}),
}: import("./handlers.js").MessageHandlerArgs): Promise<
	import("./handlers.js").MessageHandlerResult
> {
	const currentMessageNo = packet._msgNo;
	const currentMessageString = _MSG_STRING(currentMessageNo);

	log.debug(
		`[${connectionId}] Processing message: ${currentMessageNo} (${currentMessageString}), sequence: ${packet._header.sequence}`,
	);

	const result = messageHandlers.find(
		(msg) => msg.name === currentMessageString,
	);

	if (typeof result !== "undefined") {
		try {
			const responsePackets = await result.handler({
				connectionId,
				packet,
				log,
			});
			return responsePackets;
		} catch (error) {
			const err = Error(`[${connectionId}] Error processing message`,
				{ cause: error }
			);
			throw err;
		}
	}

	throw Error(
		`[${connectionId}] Unable to locate handler for message: ${currentMessageNo} (${currentMessageString})`,
	);
}

/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {SerializedBufferOld} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ name: "transactionServer" })]
 * @returns {Promise<{
 *     connectionId: string,
 *    messages: SerializedBufferOld[]
 * }>}
 */
export async function receiveTransactionsData({
	connectionId,
	message,
	log = getServerLogger({
		name: "transactionServer",
		level: getServerConfiguration({}).logLevel ?? "info",
	}),
}: {
	connectionId: string;
	message: BufferSerializer;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	messages: SerializedBufferOld[];
}> {
	log.debug(`[${connectionId}] Entering transaction module`);

	// Going to use ServerMessage in this module

	const inboundMessage = new OldServerMessage();
	inboundMessage._doDeserialize(message.serialize());
	log.debug(
		`[${connectionId}] Received message: ${inboundMessage.toHexString()}`,
	);

	// Is the message encrypted?
	if (isMessageEncrypted(inboundMessage)) {
		log.debug(`[${connectionId}] Message is encrypted`);
		// Get the encryyption settings for this connection
		const state = fetchStateFromDatabase();

		const encryptionSettings = getEncryption(state, connectionId);

		if (typeof encryptionSettings === "undefined") {
			throw Error(`[${connectionId}] Unable to locate encryption settings`);
		}

		// log the old buffer
		log.debug(
			`[${connectionId}] Inbound buffer: ${inboundMessage.data.toString("hex")}`,
		);

		try {
			const decryptedMessage = encryptionSettings.dataEncryption.decrypt(
				inboundMessage.data,
			);
			updateEncryption(state, encryptionSettings).save();

			// Verify the length of the message
			verifyLength(inboundMessage.data, decryptedMessage);

			// Assuming the message was decrypted successfully, update the buffer
			log.debug(
				`[${connectionId}] Decrypted buffer: ${decryptedMessage.toString("hex")}`,
			);

			inboundMessage.setBuffer(decryptedMessage);
			inboundMessage._header.flags -= 8;
			inboundMessage.updateMsgNo();

			log.debug(
				`[${connectionId}] Decrypted message: ${inboundMessage.toHexString()}`,
			);
		} catch (error) {
			const err = Error(`[${connectionId}] Unable to decrypt message`, {
				cause: error,
			});
			throw err;
		}
	}

	const response = await processInput({
		connectionId,
		packet: inboundMessage,
		log,
	});

	// Loop through the outbound messages and encrypt them
	const outboundMessages: SerializedBufferOld[] = [];

	response.messages.forEach((outboundMessage) => {
		log.debug(`[${connectionId}] Processing outbound message`);

		if (isMessageEncrypted(outboundMessage)) {
			const state = fetchStateFromDatabase();

			const encryptionSettings = getEncryption(state, connectionId);

			if (typeof encryptionSettings === "undefined") {
				throw Error(`[${connectionId}] Unable to locate encryption settings`);
			}

			// log the old buffer
			log.debug(
				`[${connectionId}] Outbound buffer: ${outboundMessage.data.toString("hex")}`,
			);

			try {
				const encryptedMessage = encryptionSettings.dataEncryption.encrypt(
					outboundMessage.data,
				);
				updateEncryption(state, encryptionSettings).save();

				// Verify the length of the message
				verifyLength(outboundMessage.data, encryptedMessage);

				// Assuming the message was decrypted successfully, update the buffer

				log.debug(
					`[${connectionId}] Encrypted buffer: ${encryptedMessage.toString("hex")}`,
				);

				outboundMessage.setBuffer(encryptedMessage);

				log.debug(
					`[${connectionId}] Encrypted message: ${outboundMessage.toHexString()}`,
				);

				const outboundRawMessage = new SerializedBufferOld();
				outboundRawMessage.setBuffer(outboundMessage.serialize());
				log.debug(
					`[${connectionId}] Outbound message: ${outboundRawMessage.toHexString()}`,
				);
				outboundMessages.push(outboundRawMessage);
			} catch (error) {
				const err = Error(`[${connectionId}] Unable to encrypt message`, {
					cause: error,
				});
				throw err;
			}
		} else {
			const outboundRawMessage = new SerializedBufferOld();
			outboundRawMessage.setBuffer(outboundMessage.serialize());
			log.debug(
				`[${connectionId}] Outbound message: ${outboundRawMessage.toHexString()}`,
			);
			outboundMessages.push(outboundRawMessage);
		}
	});

	log.debug(
		`[${connectionId}] Exiting transaction module with ${outboundMessages.length} messages`,
	);

	return {
		connectionId,
		messages: outboundMessages,
	};
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
