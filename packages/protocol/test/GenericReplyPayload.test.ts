import { describe, it, expect } from "vitest";
import { GenericReplyPayload } from "../src/GenericReplyPayload.js";
import { Buffer } from "buffer";

describe("GenericReplyPayload", () => {
	it("should have default values", () => {
		const payload = new GenericReplyPayload();
		expect(payload.msgReply).toBe(0);
		expect(payload.result).toBe(0);
		expect(payload.data).toBe(0);
		expect(payload.data2).toBe(0);
	});

	it("should return correct byte size", () => {
		const payload = new GenericReplyPayload();
		expect(payload.getByteSize()).toBe(16);
	});

	it("should serialize correctly", () => {
		const payload = new GenericReplyPayload();
		payload.messageId = 1;
		payload.msgReply = 2;
		payload.result = 3;
		payload.data = 4;
		payload.data2 = 5;

		const buffer = payload.serialize();
		expect(buffer.readUInt16LE(0)).toBe(1);
		expect(buffer.readUInt16LE(2)).toBe(2);
		expect(buffer.readUInt32LE(4)).toBe(3);
		expect(buffer.readUInt32LE(8)).toBe(4);
		expect(buffer.readUInt32LE(12)).toBe(5);
	});

	it("should deserialize correctly", () => {
		const buffer = Buffer.alloc(16);
		buffer.writeUInt16LE(1, 0);
		buffer.writeUInt32LE(2, 2);
		buffer.writeUInt32LE(3, 6);

		const payload = new GenericReplyPayload();
		payload.deserialize(buffer);

		expect(payload.messageId).toBe(1);
		expect(payload.data).toBe(2);
		expect(payload.data2).toBe(3);
	});

	it("should set and get data buffer correctly", () => {
		const payload = new GenericReplyPayload();
		const dataBuffer = Buffer.from([1, 2, 3, 4]);

		payload.setDataBuffer(dataBuffer);
		expect(payload.getDataBuffer()).toBe(dataBuffer);
	});
});
