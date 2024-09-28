import { BasePacket } from "./BasePacket.js";
import { BufferSerializer } from "./BufferSerializer.js";
import type { SerializableInterface, SerializableMessage } from "./types.js";

/**
 *
 */
export class ServerMessageHeader
	extends BufferSerializer
	implements SerializableInterface
{
	// All fields are little-endian
	private length: number = 0; // 2 bytes
	private signature: string = ""; // 4 bytes
	private sequence: number = 0; // 4 bytes
	private flags: number = 0; // 1

	getDataOffset(): number {
		return 11;
	}
	override getByteSize(): number {
		return 11;
	}

	getLength(): number {
		return this.length;
	}

	override serialize(): Buffer {
		const buffer = Buffer.alloc(this.getByteSize());
		buffer.writeUInt16LE(this.length, 0);
		buffer.write(this.signature, 2, 4, "ascii");
		buffer.writeUInt32LE(this.sequence, 6);
		buffer.writeUInt8(this.flags, 10);

		return buffer;
	}

	override deserialize(data: Buffer): ServerMessageHeader {
		this._assertEnoughData(data, this.getByteSize());

		this.length = data.readUInt16LE(0);
		this.signature = data.toString("utf8", 2, 6);
		this.sequence = data.readUInt32LE(6);
		this.flags = data.readUInt8(10);

		return this;
	}

	isValidSignature(): boolean {
		return this.signature === "TOMC";
	}

	isPayloadEncrypted(): boolean {
		// Does the flags bitmask contain have 0x08 set?
		return (this.flags & 0x08) != 0;
	}

	setPayloadEncryption(encrypted: boolean): ServerMessageHeader {
		if (encrypted) {
			this.flags |= 0x08;
		} else {
			this.flags &= ~0x08;
		}
		return this;
	}

	override toString(): string {
		return `ServerMessageHeader {length: ${this.length}, signature: ${this.signature}, sequence: ${this.sequence}, flags: ${this.flags}}`;
	}

	override toHexString(): string {
		return this.serialize().toString("hex");
	}

	getSequence(): number {
		return this.sequence;
	}

	setSequence(sequence: number): ServerMessageHeader {
		this.sequence = sequence;
		return this;
	}

	setLength(length: number): ServerMessageHeader {
		this.length = length;
		return this;
	}

	setSignature(signature: string): ServerMessageHeader {
		this.signature = signature;
		return this;
	}
}

export class ServerMessagePayload
	extends BufferSerializer
	implements SerializableInterface
{
	public messageId: number = 0; // 2 bytes

	override getByteSize(): number {
		return 2 + this._data.length;
	}

	override serialize(): Buffer {
		const buffer = Buffer.alloc(this.getByteSize());
		buffer.writeUInt16LE(this.messageId, 0);
		this._data.copy(buffer, 2);

		return buffer;
	}

	override deserialize(data: Buffer): ServerMessagePayload {
		this._assertEnoughData(data, 2);

		this.messageId = data.readUInt16LE(0);
		this._data = data.subarray(2);

		return this;
	}

	getMessageId(): number {
		return this.messageId;
	}

	setMessageId(messageId: number): ServerMessagePayload {
		this.messageId = messageId;
		return this;
	}
}

export class ServerPacket extends BasePacket implements SerializableMessage {
	protected override header: ServerMessageHeader;
	data: ServerMessagePayload;

	constructor(messageId: number) {
		super({});
		this.header = new ServerMessageHeader();
		this.data = new ServerMessagePayload().setMessageId(messageId);
	}
	override getDataBuffer(): Buffer {
		return this.data.serialize();
	}
	override setDataBuffer(data: Buffer): ServerPacket {
		this.data.deserialize(data);
		return this;
	}
	/** The message length is the length of the message data, not including the id */
	override getByteSize(): number {
		return this.header.getByteSize() + this.data.getByteSize();
	}

	setSequence(sequence: number): ServerPacket {
		this.header.setSequence(sequence);
		return this;
	}

	setLength(length: number): ServerPacket {
		this.header.setLength(length);
		return this;
	}

	setSignature(signature: string): ServerPacket {
		this.header.setSignature(signature);
		return this;
	}

	setPayloadEncryption(encrypted: boolean): ServerPacket {
		this.header.setPayloadEncryption(encrypted);
		return this;
	}

	getMessageId(): number {
		return this.data.getMessageId();
	}

	getLength(): number {
		return this.header.getLength();
	}

	getSequence(): number {
		return this.header.getSequence();
	}

	isPayloadEncrypted(): boolean {
		return this.header.isPayloadEncrypted();
	}

	isValidSignature(): boolean {
		return this.header.isValidSignature();
	}

	override serialize(): Buffer {
		try {
			this.ensureNonZeroSequence();

			this.ensureValidSignature();

			const buffer = Buffer.alloc(this.getByteSize());
			this.header.serialize().copy(buffer);
			this.data.serialize().copy(buffer, this.header.getByteSize());

			return buffer;
		} catch (error) {
			const err = new Error("Error serializing ServerMessage");
			err.cause = error;
			throw error;
		}
	}

	private ensureValidSignature() {
		if (!this.header.isValidSignature()) {
			throw new Error(
				"ServerMessage signature is invalid, it must be set to 'TOMC' before serializing",
			);
		}
	}

	private ensureNonZeroSequence() {
		if (this.header.getSequence() === 0) {
			throw new Error(
				"ServerMessage sequence is 0, it must be set to a non-zero value before serializing",
			);
		}
	}

	override deserialize(data: Buffer): ServerPacket {
		this._assertEnoughData(data, this.header.getByteSize());

		this.header.deserialize(data);
		this.setDataBuffer(data.subarray(this.header.getDataOffset()));

		return this;
	}

	override toString(): string {
		return `ServerMessage {length: ${this.header.getLength()}, id: ${this.data.getMessageId()}}`;
	}
}
