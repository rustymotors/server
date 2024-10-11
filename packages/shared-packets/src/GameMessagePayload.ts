import { BufferSerializer } from "./BufferSerializer.js";
import type { SerializableInterface } from "./types.js";

export class GameMessagePayload
	extends BufferSerializer
	implements SerializableInterface
{
	private isEncrypted: boolean = false; // Not serialized

	static copy(payload: GameMessagePayload): GameMessagePayload {
		const newPayload = new GameMessagePayload();
		newPayload.deserialize(payload.serialize());
		return newPayload;
	}

	override getByteSize(): number {
		return this._data.length;
	}

	override serialize(): Buffer {
		return this._data;
	}

	override deserialize(data: Buffer): GameMessagePayload {
		this._data = data;

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
