import { BufferSerializer } from "./BufferSerializer.js";
import type { SerializableInterface } from "./types.js";

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
