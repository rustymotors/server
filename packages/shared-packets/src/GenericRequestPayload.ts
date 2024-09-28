import { ServerMessagePayload } from "./ServerPacket.js";

export class GenericRequestPayload extends ServerMessagePayload {
	data: number = 0;
	data2: number = 0;

	constructor() {
		super();
	}

	override getByteSize(): number {
		return 10;
	}

	override serialize(): Buffer {
		const buffer = Buffer.alloc(this.getByteSize());

		buffer.writeUInt16LE(this.messageId, 0);
		buffer.writeUInt32LE(this.data, 2);
		buffer.writeUInt32LE(this.data2, 6);

		return buffer;
	}

	override deserialize(data: Buffer): GenericRequestPayload {
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
