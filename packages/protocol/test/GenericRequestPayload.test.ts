import { describe, it, expect } from "vitest";
import { GenericRequestPayload } from "../src/GenericRequestPayload.js";
import { Buffer } from "buffer";

describe("GenericRequestPayload", () => {
	it("should return correct byte size", () => {
		const payload = new GenericRequestPayload();
		expect(payload.getByteSize()).toBe(10);
	});

	it("should serialize data correctly", () => {
		const payload = new GenericRequestPayload();
		payload["messageId"] = 1;
		payload["data"] = 12345;
		payload["data2"] = 67890;

		const buffer = payload.serialize();
		expect(buffer.readUInt16LE(0)).toBe(1);
		expect(buffer.readUInt32LE(2)).toBe(12345);
		expect(buffer.readUInt32LE(6)).toBe(67890);
	});

	it("should deserialize data correctly", () => {
		const buffer = Buffer.alloc(10);
		buffer.writeUInt16LE(1, 0);
		buffer.writeUInt32LE(12345, 2);
		buffer.writeUInt32LE(67890, 6);

		const payload = new GenericRequestPayload();
		payload.deserialize(buffer);

		expect(payload["messageId"]).toBe(1);
		expect(payload["data"]).toBe(12345);
		expect(payload["data2"]).toBe(67890);
	});

	it("should set and get data buffer correctly", () => {
		const payload = new GenericRequestPayload();
		const dataBuffer = Buffer.from([1, 2, 3, 4, 5]);

		payload.setDataBuffer(dataBuffer);
		expect(payload.getDataBuffer()).toBe(dataBuffer);
	});

    it("should throw an error if there is not enough data to deserialize", () => {
        const buffer = Buffer.alloc(9);
        const payload = new GenericRequestPayload();

        expect(() => payload.deserialize(buffer)).toThrowError();
    });
});
