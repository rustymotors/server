import { ServerMessagePayload } from "./ServerMessagePayload.js";

export class LoginPayload extends ServerMessagePayload {
	public customerId = 0; // 4 bytes
	public personaId = 0; // 4 bytes
	public lotOwnerId = 0; // 4 bytes
	public brandedPartId = 0; // 4 bytes
	public skinId = 0; // 4 bytes
	public personaName = ""; // 13 bytes
	public mcVersion = 0; // 4 bytes

	override getByteSize(): number {
		return (
			2 + // messageId
			4 + // customerId
			4 + // personaId
			4 + // lotOwnerId
			4 + // brandedPartId
			4 + // skinId
			13 + // personaName
			4 + // mcVersion
			this._data.length
		);
	}

	override serialize(): Buffer {
		const buffer = Buffer.alloc(this.getByteSize());
		buffer.writeUInt16LE(this.messageId, 0);
		buffer.writeUInt32LE(this.customerId, 2);
		buffer.writeUInt32LE(this.personaId, 6);
		buffer.writeUInt32LE(this.lotOwnerId, 10);
		buffer.writeUInt32LE(this.brandedPartId, 14);
		buffer.writeUInt32LE(this.skinId, 18);
		buffer.write(this.personaName, 22, 13, "utf8");
		buffer.writeUInt32LE(this.mcVersion, 35);

		return buffer;
	}

	override deserialize(data: Buffer): LoginPayload {
		this.messageId = data.readUInt16LE(0);
		this.customerId = data.readUInt32LE(2);
		this.personaId = data.readUInt32LE(6);
		this.lotOwnerId = data.readUInt32LE(10);
		this.brandedPartId = data.readUInt32LE(14);
		this.skinId = data.readUInt32LE(18);
		this.personaName = data.toString("utf8", 22, 35);
		this.mcVersion = data.readUInt32LE(35);

		return this;
	}

	override toString(): string {
		return `LoginPayload{customerId=${this.customerId}, personaId=${this.personaId}, lotOwnerId=${this.lotOwnerId}, brandedPartId=${this.brandedPartId}, skinId=${this.skinId}, personaName=${this.personaName}, mcVersion=${this.mcVersion}}`;
	}
}
