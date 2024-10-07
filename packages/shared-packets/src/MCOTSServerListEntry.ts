import { BufferSerializer } from "./BufferSerializer.js";

export class MCOTSServerListEntry extends BufferSerializer {
	public mcotsId = 0; // 4 bytes
	public port = 0; // 2 bytes
	public ip = ""; // 4 bytes

	public priority = 0; // 2 bytes
	public dutyFlags = 0; // 2 bytes

	override getByteSize(): number {
		return 4 + 2 + 4 + 2 + 2;
	}

	override serialize(): Buffer {
		const buffer = Buffer.alloc(this.getByteSize());
		let offset = 0;

		buffer.writeUInt32LE(this.mcotsId, offset);
		offset += 4;

		buffer.writeUInt16LE(this.port, offset);
		offset += 2;

		buffer.write(this.ip, offset, 4, "utf8");
		offset += 4;

		buffer.writeUInt16LE(this.priority, offset);
		offset += 2;

		buffer.writeUInt16LE(this.dutyFlags, offset);
		offset += 2;

		return buffer;
	}

	override deserialize(data: Buffer): MCOTSServerListEntry {
		this._assertEnoughData(data, this.getByteSize());

		let offset = 0;

		this.mcotsId = data.readUInt32LE(offset);
		offset += 4;

		this.port = data.readUInt16LE(offset);
		offset += 2;

		this.ip = data.toString("utf8", offset, offset + 4);
		offset += 4;

		this.priority = data.readUInt16LE(offset);
		offset += 2;

		this.dutyFlags = data.readUInt16LE(offset);
		offset += 2;

		return this;
	}

	override toString(): string {
		return `MCOTSServerListEntry {mcotsId: ${this.mcotsId}, port: ${this.port}, ip: ${this.ip}, priority: ${this.priority}, dutyFlags: ${this.dutyFlags}}`;
	}
}
