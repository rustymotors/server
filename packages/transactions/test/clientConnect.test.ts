import { describe, expect, it } from "vitest";
import { getDatabaseServer } from "../../database/src/DatabaseManager.js";
import { State } from "../../shared/State.js";
import { ServerError } from "../../shared/errors/ServerError.js";
import { getServerLogger } from "../../shared/log.js";
import { TClientConnectMessage } from "../src/TClientConnectMessage.js";
import { clientConnect } from "../src/clientConnect.js";

describe("clientConnect", () => {
	it("throws when connection is not found", async () => {
		// arrange
		const customerId = 1234;
		const connectionId = "test";
		const sessionKey =
			"1234567890123456123456789012345612345678901234561234567890123456";
		const contextId = "test";
		const incomingMessage = new TClientConnectMessage();
		incomingMessage._customerId = customerId;

		const log = getServerLogger({});
		const state: State = {
			encryptions: {},
			sessions: {},
			filePaths: {},
			sockets: {},
			queuedConnections: {},
			onDataHandlers: {},
			save() {},
		};
		getDatabaseServer().updateSessionKey(
			customerId,
			sessionKey,
			contextId,
			connectionId,
		);

		// act
		try {
			await clientConnect({
				connectionId,
				packet: incomingMessage,
				log,
			});
		} catch (error) {
			// assert
			expect(error).toEqual(
				new ServerError(`Encryption not found for connection ${connectionId}`),
			);
		}
	});
});
