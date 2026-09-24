import { NetworkMessage, configurationProvider, databaseProvider } from "rusty-motors-shared";
import { NPSUserStatus } from "./NPSUserStatus.js";
import { type ServerLogger, getServerLogger } from "rusty-motors-shared";
import { GamePacket } from "rusty-motors-protocol";
import type { BytableMessage } from "@rustymotors/binary";


/**
 * Builds the body of the NPS_USER_VALID (0x601) login reply in the layout the
 * client parses. All integers are big-endian.
 *
 *   uint32 customerId
 *   uint32 profileId
 *   uint8  isCacheHit
 *   uint16 length + ban record
 *   uint16 length + gag record
 *   uint16 length + key record
 *   uint32 (unknown, sent as 0)
 *   uint16 length + string, up to 64 bytes (unknown, sent empty)
 *
 * Ban and gag records share one shape: uint32 (unknown), uint32 start,
 * uint32 end, then three uint16-length strings of up to 64, 256, and 256 bytes.
 * The client treats a record as active when start is nonzero and end is zero or
 * later than the current time, so all zeros means not banned and not gagged.
 *
 * The key record is a uint16-length string of up to 32 bytes followed by a
 * uint32. What the client does with it is not yet known; it is sent empty.
 *
 * The client reads each record field by field and then skips ahead by the
 * record's length prefix, so every prefix must equal the record's real size.
 * A body that is shorter or lacks the prefixes makes the client read its
 * lengths from the wrong bytes and run past the end of the message, which
 * crashes, hangs, or silently succeeds depending on the memory beyond it.
 */
export function buildUserValidBody(
	customerId: number,
	profileId: number,
): Buffer {
	const lengthPrefixed = (content: Buffer): Buffer => {
		const prefix = Buffer.alloc(2);
		prefix.writeUInt16BE(content.length, 0);
		return Buffer.concat([prefix, content]);
	};
	const emptyString = lengthPrefixed(Buffer.alloc(0));
	const inactiveRecord = lengthPrefixed(
		Buffer.concat([Buffer.alloc(12), emptyString, emptyString, emptyString]),
	);
	const emptyKeyRecord = lengthPrefixed(
		Buffer.concat([emptyString, Buffer.alloc(4)]),
	);
	const identity = Buffer.alloc(9);
	identity.writeInt32BE(customerId, 0);
	identity.writeInt32BE(profileId, 4);
	identity.writeUInt8(0, 8); // isCacheHit
	return Buffer.concat([
		identity,
		inactiveRecord, // ban
		inactiveRecord, // gag
		emptyKeyRecord,
		Buffer.alloc(4),
		emptyString,
	]);
}

/**
 * Process a UserLogin packet
 * @private
 * @param {object} args
 * @param {string} args.connectionId
 * @param {BytableMessage} args.message
 * @param {ServerLogger} [args.log=getServerLogger("LoginServer")]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: BytableBuffer[],
 * }>}
 */
export async function login({
	connectionId,
	message,
	log = getServerLogger( "LoginServer"),
}: {
	connectionId: string;
	message: BytableMessage;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	messages: GamePacket[];
}> {
	const data = message.serialize();

	// Get configuration from provider (uses GatewayConfiguration if available, otherwise falls back)
	const config = configurationProvider.getSharedConfiguration();
	const userStatus = new NPSUserStatus(data, config, log);

	userStatus.extractSessionKeyFromPacket(data);

	const { contextId, sessionKey } = userStatus;

	log.debug(`[${connectionId}] Context ID: ${contextId}`);
	userStatus.dumpPacket();

	// Load the customer record by contextId
	const authStore = databaseProvider.getAuthStore();
	const userRecord = authStore.findCustomerByContext(contextId);

	if (typeof userRecord === "undefined") {
		// We were not able to locate the user's record
		throw Error(
			`[${connectionId}] Unable to locate user record for contextId: ${contextId}`,
		);
	}

	// Save sessionkey in database under customerId
	const sessionStore = databaseProvider.getSessionStore();
	await sessionStore.updateSessionKey(
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

	const outboundMessage = new NetworkMessage(0x601);

	const dataBuffer = buildUserValidBody(
		userRecord.customerId,
		userRecord.profileId,
	);

	const packetContent = dataBuffer;

	// Set the packet content in the outbound message
	outboundMessage.data = packetContent;

	const outboundMessage2 = new GamePacket();
	outboundMessage2.deserialize(outboundMessage.serialize());


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



