import { describe, it, expect } from "vitest";
import { GameMessagePayload } from "../src/GameMessagePayload.js";

describe("GameMessagePayload", () => {
	it("should create a copy of the payload", () => {
		const originalPayload = new GameMessagePayload();
		originalPayload.deserialize(Buffer.from("test data"));

		const copiedPayload = GameMessagePayload.copy(originalPayload);

		expect(copiedPayload).not.toBe(originalPayload);
		expect(copiedPayload.serialize()).toEqual(originalPayload.serialize());
	});

	it("should return the correct byte size", () => {
		const payload = new GameMessagePayload();
		payload.deserialize(Buffer.from("test data"));

		expect(payload.getByteSize()).toBe(9);
	});

	it("should serialize the payload correctly", () => {
		const payload = new GameMessagePayload();
		const buffer = Buffer.from("test data");
		payload.deserialize(buffer);

		expect(payload.serialize()).toEqual(buffer);
	});

	it("should deserialize the payload correctly", () => {
		const payload = new GameMessagePayload();
		const buffer = Buffer.from("test data");
		payload.deserialize(buffer);

		expect(payload.serialize()).toEqual(buffer);
	});

	it("should correctly indicate if the payload is encrypted", () => {
		const payload = new GameMessagePayload();

		expect(payload.isPayloadEncrypted()).toBe(false);

		payload.setPayloadEncryption(true);
		expect(payload.isPayloadEncrypted()).toBe(true);
	});

	it("should set the payload encryption correctly", () => {
		const payload = new GameMessagePayload();

		payload.setPayloadEncryption(true);
		expect(payload.isPayloadEncrypted()).toBe(true);

		payload.setPayloadEncryption(false);
		expect(payload.isPayloadEncrypted()).toBe(false);
	});
});
