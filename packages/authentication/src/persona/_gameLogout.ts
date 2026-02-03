import { type ServerLogger, LegacyMessage } from "rusty-motors-shared";
import { getServerLogger } from "rusty-motors-shared";
import { BytableBuffer } from "@rustymotors/binary";


/**
 * Handle game logout
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {ServerLogger} [args.log=getServerLogger({ name: "LoginServer" })]
 * @returns {Promise<{
 *  connectionId: string,
 * messages: BytableBuffer[],
 * }>}
 */

export async function _gameLogout({
	connectionId,
	message,
	log = getServerLogger( "persona._gameLogout"),
}: {
	connectionId: string;
	message: LegacyMessage;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	messages: BytableBuffer[];
}> {
	const requestPacket = message;
	log.debug(`[${connectionId}] _npsLogoutGameUser request: ${requestPacket.toHexString()}`);

	// Build the packet
	const responsePacket = new LegacyMessage();
	responsePacket._header.id = 519;
	log.debug(`[${connectionId}] _npsLogoutGameUser response: ${responsePacket.toHexString()}`);

	const outboundMessage = new BytableBuffer();
	outboundMessage.deserialize(responsePacket._doSerialize());

	return {
		connectionId,
		messages: [outboundMessage],
	};
}
