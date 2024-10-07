import { BasePacket } from "./BasePacket.js";
import { ServerMessageHeader } from "./ServerMessageHeader.js";
import { ServerMessagePayload } from "./ServerMessagePayload.js";
import type { SerializableMessage } from "./types.js";

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
				`ServerPacket sequence is 0, it must be set to a non-zero value before serializing`,
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
		return `ServerPacket {length: ${this.getLength()}, sequence: ${this.getSequence()}, messageId: ${this.getMessageId()}}`;
	}
}
