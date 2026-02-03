import { ServerMessagePayload } from "./ServerMessagePayload.js";

export class GenericReplyPayload extends ServerMessagePayload {
	msgReply: number = 0; // 2 bytes
	result: number = 0; // 4 bytes
	data: number = 0; // 4 bytes
	data2: number = 0; // 4 bytes

	constructor() {
		super();
	}

	override getByteSize(): number {
		return 16;
	}

	override serialize(): Buffer {
		const buffer = Buffer.alloc(this.getByteSize());

		buffer.writeUInt16LE(this.messageId, 0);
		buffer.writeUInt16LE(this.msgReply, 2);
		buffer.writeUInt32LE(this.result, 4);
		buffer.writeUInt32LE(this.data, 8);
		buffer.writeUInt32LE(this.data2, 12);

		return buffer;
	}

	override deserialize(data: Buffer): GenericReplyPayload {
		this._assertEnoughData(data, 10);

		this.messageId = data.readUInt16LE(0);
		this.data = data.readUInt32LE(2);
		this.data2 = data.readUInt32LE(6);

		return this;
	}

	getDataBuffer(): Buffer {
		return this._data;
	}

	setDataBuffer(data: Buffer): void {
		this._data = data;
	}
}
