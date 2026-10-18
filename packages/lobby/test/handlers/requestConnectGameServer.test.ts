import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ISessionStore } from "rusty-motors-shared";
import { NoResultsError } from "rusty-motors-shared";
import { loggerMock } from "rusty-motors-shared/test";

const getPersonaByPersonaId = vi.hoisted(() => vi.fn());

vi.mock("rusty-motors-authentication", () => ({ getPersonaByPersonaId }));

import { _npsRequestGameConnectServer } from "../../src/handlers/requestConnectGameServer.js";

// Real LoginInfoMessage packet (opCode 0x0100) from a session fixture, userId 21
const FIXTURE_PACKET_HEX =
	"0100008f000000150000000944722042726f776e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000054b46c0000000000000008342e352e302e3000000000046d636f000000000a31302e31302e352e3800ba7e6a9dbbd72029f837d90e4f1f0dca";

function makeMessage() {
	const packet = Buffer.from(FIXTURE_PACKET_HEX, "hex");
	return { serialize: () => packet } as never;
}

function makeSessionStore(
	fetchSessionKeyByCustomerId: ISessionStore["fetchSessionKeyByCustomerId"],
): ISessionStore {
	return { fetchSessionKeyByCustomerId } as unknown as ISessionStore;
}

function replyId(result: { messages: { serialize(): Buffer }[] }) {
	expect(result.messages).toHaveLength(1);
	return result.messages[0]!.serialize().readUInt16BE(0);
}

describe("_npsRequestGameConnectServer error replies", () => {
	beforeEach(() => {
		getPersonaByPersonaId.mockReset();
	});

	it("replies NPS_REFUSED (0x213) when the persona is unknown", async () => {
		getPersonaByPersonaId.mockRejectedValue(
			new NoResultsError("Unable to locate a persona for id: 21"),
		);

		const result = await _npsRequestGameConnectServer({
			connectionId: "unknown-persona:7003",
			message: makeMessage(),
			log: loggerMock,
			sessionStore: makeSessionStore(vi.fn()),
		});

		expect(replyId(result)).toBe(0x213);
	});

	it("replies NPS_REFUSED (0x213) when the persona lookup fails for another reason", async () => {
		getPersonaByPersonaId.mockRejectedValue(new Error("lookup failed"));

		const result = await _npsRequestGameConnectServer({
			connectionId: "lookup-error:7003",
			message: makeMessage(),
			log: loggerMock,
			sessionStore: makeSessionStore(vi.fn()),
		});

		expect(replyId(result)).toBe(0x213);
	});

	it("replies NPS_INVALID_KEY (0x22a) when the customer has no session key", async () => {
		getPersonaByPersonaId.mockResolvedValue({
			customerId: 0x54b46c,
			personaId: 21,
			personaName: "Dr Brown",
			shardId: 1,
		});
		const fetchSessionKeyByCustomerId = vi
			.fn()
			.mockRejectedValue(new Error("Session key not found for customer"));

		const result = await _npsRequestGameConnectServer({
			connectionId: "no-key:7003",
			message: makeMessage(),
			log: loggerMock,
			sessionStore: makeSessionStore(fetchSessionKeyByCustomerId),
		});

		expect(fetchSessionKeyByCustomerId).toHaveBeenCalledWith(0x54b46c);
		expect(replyId(result)).toBe(0x22a);
	});
});
