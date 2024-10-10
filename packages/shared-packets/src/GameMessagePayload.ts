import { BufferSerializer } from "./BufferSerializer.js";
import type { SerializableInterface } from "./types.js";

export class GameMessagePayload
	extends BufferSerializer
	implements SerializableInterface
{
	public messageId: number = 0; // 2 bytes

	private isEncrypted: boolean = false; // Not serialized

	static copy(payload: GameMessagePayload): GameMessagePayload {
		const newPayload = new GameMessagePayload();
		newPayload.messageId = payload.messageId;
		newPayload._data = Buffer.from(payload._data);
		return newPayload;
	}

	override getByteSize(): number {
		return 2 + this._data.length;
	}

	override serialize(): Buffer {
		const buffer = Buffer.alloc(this.getByteSize());
		buffer.writeUInt16LE(this.messageId, 0);
		this._data.copy(buffer, 2);

		return buffer;
	}

	override deserialize(data: Buffer): GameMessagePayload {
		this._assertEnoughData(data, 2);

		this.messageId = data.readUInt16LE(0);
		this._data = data.subarray(2);

		return this;
	}

	getMessageId(): number {
		return this.messageId;
	}

	setMessageId(messageId: number): GameMessagePayload {
		this.messageId = messageId;
		return this;
	}

	isPayloadEncrypted(): boolean {
		return this.isEncrypted;
	}

	setPayloadEncryption(encrypted: boolean): GameMessagePayload {
		this.isEncrypted = encrypted;
		return this;
	}
}
