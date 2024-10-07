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

import {
	getServerConfiguration,
	type ServerLogger,
	type UserRecordMini,
} from "rusty-motors-shared";
import { getServerLogger } from "rusty-motors-shared";
import { SerializedBufferOld } from "rusty-motors-shared";
import { NPSMessage } from "rusty-motors-shared";
import { NetworkMessage } from "rusty-motors-shared";
import { NPSUserStatus } from "./NPSUserStatus.js";
import { updateSessionKey } from "rusty-motors-database";

const userRecords: UserRecordMini[] = [
	{
		contextId: "5213dee3a6bcdb133373b2d4f3b9962758",
		customerId: 0x0012808b,
		userId: 0x00000002,
	},
	{
		contextId: "d316cd2dd6bf870893dfbaaf17f965884e",
		customerId: 0x0054b46c,
		userId: 0x00000001,
	},
];

/**
 * Process a UserLogin packet
 * @private
 * @param {object} args
 * @param {string} args.connectionId
 * @param {SerializedBufferOld} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ name: "LoginServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: SerializedBufferOld[],
 * }>}
 */
async function login({
	connectionId,
	message,
	log = getServerLogger({
		name: "LoginServer",
	}),
}: {
	connectionId: string;
	message: SerializedBufferOld;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	messages: SerializedBufferOld[];
}> {
	const data = message.serialize();

	log.debug(`[${connectionId}] Entering login`);

	log.debug(`[${connectionId}] Creating NPSUserStatus object`);
	const userStatus = new NPSUserStatus(data, getServerConfiguration({}), log);
	log.debug(`[${connectionId}] NPSUserStatus object created`);

	log.debug(`[${connectionId}] Extracting session key from packet`);
	userStatus.extractSessionKeyFromPacket(data);
	log.debug(`[${connectionId}] Session key extracted`);

	const { contextId, sessionKey } = userStatus;

	log.debug(`[${connectionId}] Context ID: ${contextId}`);
	userStatus.dumpPacket();

	// Load the customer record by contextId
	// TODO: #1175 Move customer records from being hard-coded to database records
	const userRecord = userRecords.find((r) => {
		return r.contextId === contextId;
	});

	if (typeof userRecord === "undefined") {
		// We were not able to locate the user's record
		throw Error(
			`[${connectionId}] Unable to locate user record for contextId: ${contextId}`,
		);
	}

	// Save sessionkey in database under customerId
	log.debug(`[${connectionId}] Updating session key in the database`);
	await updateSessionKey(
		userRecord.customerId,
		sessionKey ?? "",
		contextId,
		connectionId,
	).catch((error) => {
		const err = Error(
			`[${connectionId}] Error updating session key in the database`,
			{ cause: error },
		);
		throw err;
	});

	log.debug(`[${connectionId}] Creating outbound message`);

	const outboundMessage = new NetworkMessage(0x601);

	const dataBuffer = Buffer.alloc(26);
	let offset = 0;
	dataBuffer.writeInt32BE(userRecord.customerId, offset);
	offset += 4;
	dataBuffer.writeInt32BE(userRecord.userId, offset);
	offset += 4;
	dataBuffer.writeInt8(0, offset); // isCacheHit
	offset += 1;
	dataBuffer.writeInt8(0, offset); // ban
	offset += 1;
	dataBuffer.writeInt8(0, offset); // gag
	offset += 1;
	dataBuffer.write(sessionKey ?? "", offset, 12, "ascii");

	const packetContent = dataBuffer;

	// Set the packet content in the outbound message
	outboundMessage.data = packetContent;

	log.debug(
		`[${connectionId}] Outbound message: ${outboundMessage.toHexString()}`,
	);

	const outboundMessage2 = new SerializedBufferOld();
	outboundMessage2._doDeserialize(outboundMessage.serialize());

	log.debug(
		`[${connectionId}] Outbound message2: ${outboundMessage2.toHexString()}`,
	);

	// Update the data buffer
	const response = {
		connectionId,
		messages: [outboundMessage2, outboundMessage2],
	};
	log.debug(
		`[${connectionId}] Leaving login with ${response.messages.length} messages`,
	);
	return response;
}

/**
 * Array of supported message handlers
 *
 * @type {{
 *  opCode: number,
 * name: string,
 * handler: (args: {
 * connectionId: string,
 * message: SerializedBufferOld,
 * log: import("pino").Logger,
 * }) => Promise<{
 * connectionId: string,
 * messages: SerializedBufferOld[],
 * }>}[]}
 */
export const messageHandlers: {
	opCode: number;
	name: string;
	handler: (args: {
		connectionId: string;
		message: SerializedBufferOld;
		log: ServerLogger;
	}) => Promise<{
		connectionId: string;
		messages: SerializedBufferOld[];
	}>;
}[] = [
	{
		opCode: 1281, // 0x0501
		name: "UserLogin",
		handler: login,
	},
];

/**
 * Entry and exit point of the Login service
 *
 * @export
 * @param {object} args
 * @param {string} args.connectionId
 * @param {SerializedBufferOld} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ name: "LoginServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: SerializedBufferOld[],
 * }>}
 */
export async function handleLoginData({
	connectionId,
	message,
	log = getServerLogger({
		name: "handleLoginData",
	}),
}: {
	connectionId: string;
	message: SerializedBufferOld;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	messages: SerializedBufferOld[];
}> {
	log.debug(`[${connectionId}] Entering handleLoginData`);

	// The packet needs to be an NPSMessage
	const inboundMessage = new NPSMessage();
	inboundMessage._doDeserialize(message.serialize());

	const supportedHandler = messageHandlers.find((h) => {
		return h.opCode === inboundMessage._header.id;
	});

	if (typeof supportedHandler === "undefined") {
		// We do not yet support this message code
		throw Error(
			`[${connectionId}] UNSUPPORTED_MESSAGECODE: ${inboundMessage._header.id}`,
		);
	}

	try {
		const result = await supportedHandler.handler({
			connectionId,
			message,
			log,
		});
		log.debug(
			`[${connectionId}] Leaving handleLoginData with ${result.messages.length} messages`,
		);
		return result;
	} catch (error) {
		const err = Error(`[${connectionId}] Error in login service`, {
			cause: error,
		});
		throw err;
	}
}
