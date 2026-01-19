import { NetworkMessage, configurationProvider, databaseProvider } from "rusty-motors-shared";
import { NPSUserStatus } from "./NPSUserStatus.js";
import { ServerLogger, getServerLogger } from "rusty-motors-shared";
import { GamePacket } from "rusty-motors-protocol";
import { BytableMessage } from "@rustymotors/binary";


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

	const dataBuffer = Buffer.alloc(26);
	let offset = 0;
	dataBuffer.writeInt32BE(userRecord.customerId, offset);
	offset += 4;
	dataBuffer.writeInt32BE(userRecord.profileId, offset);
	offset += 4;
	dataBuffer.writeInt8(0, offset); // isCacheHit
	offset += 1;
	dataBuffer.writeUInt8(0, offset); // ban
	offset += 1;
	dataBuffer.writeUInt8(0, offset); // gag
	offset += 1;
	dataBuffer.write(sessionKey ?? "", offset, 12, "ascii");

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



