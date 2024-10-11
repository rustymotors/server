import { BufferSerializer } from "./BufferSerializer.js";
import type { SerializableInterface } from "./types.js";

/**
 * Represents the header of a server message.
 * The header contains the length of the message data, 
 * the signature of the message,
 * 
 * This is a little-endian structure.
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

	constructor() {
		super();
	}

	static copy(header: ServerMessageHeader): ServerMessageHeader {
		const newHeader = new ServerMessageHeader();
		newHeader.length = header.length;
		newHeader.signature = header.signature;
		newHeader.sequence = header.sequence;
		newHeader.flags = header.flags;
		return newHeader;
	}

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
