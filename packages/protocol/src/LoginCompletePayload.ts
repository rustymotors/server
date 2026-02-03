import { MCOTSServerListEntry } from "./MCOTSServerListEntry.js";
import { ServerMessagePayload } from "./ServerMessagePayload.js";
import { SqlTimeStamp } from "./SqlTimeStamp.js";

export class LoginCompletePayload extends ServerMessagePayload {
	public serverTime = 0; // 4 bytes
	public firstTime = false; // 1 byte
	public paycheckWaiting = false; // 1 byte
	public clubInvitesWaiting = false; // 1 byte
	public tallyInProcess = false; // 1 byte
	public secondsTilShutdown = 0; // 2 bytes

	public shardGNP = 0; // 8 bytes - double
	public shardCarsSold = 0; // 4 bytes
	public shardAverageSalary = 0; // 4 bytes
	public shardAverageCarsOwned = 0; // 4 bytes
	public shardAveragePlayerLevel = 0; // 4 bytes

	public serverList: MCOTSServerListEntry[] = [];

	public cookie = 0; // 4 bytes

	public nextTallyDate: SqlTimeStamp = new SqlTimeStamp();
	public nextPaycheckDate: SqlTimeStamp = new SqlTimeStamp();

	override getByteSize(): number {
		return (
			2 + // messageId
			4 + // serverTime
			1 + // firstTime
			1 + // paycheckWaiting
			1 + // clubInvitesWaiting
			1 + // tallyInProcess
			2 + // secondsTilShutdown
			8 + // shardGNP
			4 + // shardCarsSold
			4 + // shardAverageSalary
			4 + // shardAverageCarsOwned
			4 + // shardAveragePlayerLevel
			4 + // cookie
			this.nextTallyDate.getByteSize() +
			this.nextPaycheckDate.getByteSize() +
			this.serverList.reduce((acc, server) => acc + server.getByteSize(), 0)
		);
	}

	override serialize(): Buffer {
		const buffer = Buffer.alloc(this.getByteSize());
		let offset = 0;

		buffer.writeUInt16LE(this.messageId, offset);
		offset += 2;

		buffer.writeUInt32LE(this.serverTime, offset);
		offset += 4;

		buffer.writeUInt8(this.firstTime ? 1 : 0, offset);
		offset += 1;

		buffer.writeUInt8(this.paycheckWaiting ? 1 : 0, offset);
		offset += 1;

		buffer.writeUInt8(this.clubInvitesWaiting ? 1 : 0, offset);
		offset += 1;

		buffer.writeUInt8(this.tallyInProcess ? 1 : 0, offset);
		offset += 1;

		buffer.writeUInt16LE(this.secondsTilShutdown, offset);
		offset += 2;

		buffer.writeDoubleLE(this.shardGNP, offset);
		offset += 8;

		buffer.writeUInt32LE(this.shardCarsSold, offset);
		offset += 4;

		buffer.writeUInt32LE(this.shardAverageSalary, offset);
		offset += 4;

		buffer.writeUInt32LE(this.shardAverageCarsOwned, offset);
		offset += 4;

		buffer.writeUInt32LE(this.shardAveragePlayerLevel, offset);
		offset += 4;

		buffer.writeUInt32LE(this.cookie, offset);
		offset += 4;

		for (const server of this.serverList) {
			const serverBuffer = server.serialize();
			serverBuffer.copy(buffer, offset);
			offset += serverBuffer.length;
		}

		offset = this.nextTallyDate.serialize().copy(buffer, offset);
		offset = this.nextPaycheckDate.serialize().copy(buffer, offset);

		return buffer;
	}

	override deserialize(data: Buffer): LoginCompletePayload {
		this._assertEnoughData(data, 2);

		let offset = 0;

		this.messageId = data.readUInt16LE(offset);
		offset += 2;

		this.serverTime = data.readUInt32LE(offset);
		offset += 4;

		this.firstTime = data.readUInt8(offset) === 1;
		offset += 1;

		this.paycheckWaiting = data.readUInt8(offset) === 1;
		offset += 1;

		this.clubInvitesWaiting = data.readUInt8(offset) === 1;
		offset += 1;

		this.tallyInProcess = data.readUInt8(offset) === 1;
		offset += 1;

		this.secondsTilShutdown = data.readUInt16LE(offset);
		offset += 2;

		this.shardGNP = data.readDoubleLE(offset);
		offset += 8;

		this.shardCarsSold = data.readUInt32LE(offset);
		offset += 4;

		this.shardAverageSalary = data.readUInt32LE(offset);
		offset += 4;

		this.shardAverageCarsOwned = data.readUInt32LE(offset);
		offset += 4;

		this.shardAveragePlayerLevel = data.readUInt32LE(offset);
		offset += 4;

		this.cookie = data.readUInt32LE(offset);
		offset += 4;

		while (offset < data.length) {
			const server = new MCOTSServerListEntry();
			offset = server.deserialize(data.subarray(offset)).getByteSize();
			this.serverList.push(server);
		}

		offset = this.nextTallyDate
			.deserialize(data.subarray(offset))
			.getByteSize();
		offset = this.nextPaycheckDate
			.deserialize(data.subarray(offset))
			.getByteSize();

		return this;
	}

	override toString(): string {
		return `LoginCompletePayload {serverTime: ${this.serverTime}, firstTime: ${this.firstTime}, paycheckWaiting: ${this.paycheckWaiting}, clubInvitesWaiting: ${this.clubInvitesWaiting}, tallyInProcess: ${this.tallyInProcess}, secondsTilShutdown: ${this.secondsTilShutdown}, shardGNP: ${this.shardGNP}, shardCarsSold: ${this.shardCarsSold}, shardAverageSalary: ${this.shardAverageSalary}, shardAverageCarsOwned: ${this.shardAverageCarsOwned}, shardAveragePlayerLevel: ${this.shardAveragePlayerLevel}, cookie: ${this.cookie}, nextTallyDate: ${this.nextTallyDate}, nextPaycheckDate: ${this.nextPaycheckDate}, serverList: ${this.serverList}}`;
	}
}
