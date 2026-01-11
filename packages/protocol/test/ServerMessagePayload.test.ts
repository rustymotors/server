import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";
import { ServerMessagePayload } from "../src/ServerMessagePayload.js";

describe("ServerMessagePayload", () => {
	it("should copy correctly", () => {
		const originalPayload = new ServerMessagePayload();
		originalPayload.setMessageId(1234);
		originalPayload["_data"] = Buffer.from("test data");

		const copiedPayload = ServerMessagePayload.copy(originalPayload);

		expect(copiedPayload.getMessageId()).toBe(1234);
		expect(copiedPayload["_data"].toString("utf8")).toBe("test data");
		expect(copiedPayload).not.toBe(originalPayload);
		expect(copiedPayload["_data"]).not.toBe(originalPayload["_data"]);
	});
});
