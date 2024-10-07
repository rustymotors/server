import { describe, it, expect } from "vitest";
import { BasePacket } from "./BasePacket.js";
import { BufferSerializer } from "./BufferSerializer.js";

describe("BasePacket", () => {
	it("should initialize with default values", () => {
		const packet = new BasePacket({});
		expect(packet.connectionId).toBe("");
		expect(packet.messageId).toBe(0);
		expect(packet.sequence).toBe(0);
		expect(packet.messageSource).toBe("");
		expect(packet.getDataBuffer()).toEqual(Buffer.alloc(0));
	});

	it("should initialize with provided values", () => {
		const packet = new BasePacket({
			connectionId: "123",
			messageId: 1,
			sequence: 2,
			messageSource: "source",
		});
		expect(packet.connectionId).toBe("123");
		expect(packet.messageId).toBe(1);
		expect(packet.sequence).toBe(2);
		expect(packet.messageSource).toBe("source");
	});

	it("should serialize data correctly", () => {
		const packet = new BasePacket({});
		const bufferSerializer = new BufferSerializer();
		const serializedHeader = bufferSerializer.serialize();
		const serializedData = packet.serialize();
		expect(serializedData).toEqual(
			Buffer.concat([serializedHeader, Buffer.alloc(0)]),
		);
	});

	it("should deserialize data correctly", () => {
		const packet = new BasePacket({});
		const bufferSerializer = new BufferSerializer();
		const serializedHeader = bufferSerializer.serialize();
		const data = Buffer.concat([serializedHeader, Buffer.from("test")]);
		packet.deserialize(data);
		expect(packet.getDataBuffer()).toEqual(Buffer.from("test"));
	});

	it("should return correct byte size", () => {
		const packet = new BasePacket({});
		const bufferSerializer = new BufferSerializer();
		const headerSize = bufferSerializer.getByteSize();
		expect(packet.getByteSize()).toBe(headerSize);
		packet.setDataBuffer(Buffer.from("test"));
		expect(packet.getByteSize()).toBe(headerSize + 4);
	});

	it("should set and get data buffer correctly", () => {
		const packet = new BasePacket({});
		const data = Buffer.from("test");
		packet.setDataBuffer(data);
		expect(packet.getDataBuffer()).toEqual(data);
	});
});
