import { BufferSerializer } from "./BufferSerializer.js";

export class SqlTimeStamp extends BufferSerializer {
	public year = 0; // 2 bytes
	public month = 0; // 2 bytes
	public day = 0; // 2 bytes
	public hour = 0; // 2 bytes
	public minute = 0; // 2 bytes
	public second = 0; // 2 bytes
	public microsecond = 0; // 4 bytes

	override getByteSize(): number {
		return 16;
	}

	override serialize(): Buffer {
		const buffer = Buffer.alloc(16);
		buffer.writeUInt16LE(this.year, 0);
		buffer.writeUInt16LE(this.month, 2);
		buffer.writeUInt16LE(this.day, 4);
		buffer.writeUInt16LE(this.hour, 6);
		buffer.writeUInt16LE(this.minute, 8);
		buffer.writeUInt16LE(this.second, 10);
		buffer.writeUInt32LE(this.microsecond, 12);

		return buffer;
	}

	override deserialize(data: Buffer): SqlTimeStamp {
		this._assertEnoughData(data, 16);

		this.year = data.readUInt16LE(0);
		this.month = data.readUInt16LE(2);
		this.day = data.readUInt16LE(4);
		this.hour = data.readUInt16LE(6);
		this.minute = data.readUInt16LE(8);
		this.second = data.readUInt16LE(10);
		this.microsecond = data.readUInt32LE(12);

		return this;
	}

	getTimestamp(): number {
		return Date.UTC(
			this.year,
			this.month - 1,
			this.day,
			this.hour,
			this.minute,
			this.second,
			this.microsecond / 1000,
		);
	}

	setTimestamp(timestamp: number): SqlTimeStamp {
		const date = new Date(timestamp);

		this.year = date.getUTCFullYear();
		this.month = date.getUTCMonth() + 1;
		this.day = date.getUTCDate();
		this.hour = date.getUTCHours();
		this.minute = date.getUTCMinutes();
		this.second = date.getUTCSeconds();
		this.microsecond = date.getUTCMilliseconds() * 1000;

		return this;
	}

	override toString(): string {
		return `${this.year}-${this.month}-${this.day} ${this.hour}:${this.minute}:${this.second}.${this.microsecond}`;
	}
}
