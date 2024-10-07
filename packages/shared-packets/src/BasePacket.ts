import { BufferSerializer } from "./BufferSerializer.js";
import type { SerializableInterface, SerializableMessage } from "./types.js";

export class BasePacket
	extends BufferSerializer
	implements SerializableMessage
{
	connectionId: string;
	messageId: number;
	sequence: number;
	messageSource: string;

	protected override _data: Buffer = Buffer.alloc(0);
	protected header: SerializableInterface = new BufferSerializer();

	constructor({
		connectionId = "",
		messageId = 0,
		sequence = 0,
		messageSource = "",
	}) {
		super();
		this.connectionId = connectionId;
		this.messageId = messageId;
		this.sequence = sequence;
		this.messageSource = messageSource;
	}

	override toString(): string {
		return `Connection ID: ${this.connectionId}, Message ID: ${this.messageId}, Message Sequence: ${this.sequence}, Message Source: ${this.messageSource}`;
	}
	override serialize(): Buffer {
		return Buffer.concat([this.header.serialize(), this._data]);
	}
	override deserialize(data: Buffer): void {
		this.header.deserialize(data.subarray(0, this.header.getByteSize()));
		this._data = data.subarray(this.header.getByteSize());
	}
	override getByteSize(): number {
		return this.header.getByteSize() + this._data.length;
	}

	getDataBuffer(): Buffer {
		return this._data;
	}

	setDataBuffer(data: Buffer): void {
		this._data = data;
	}
}
