import { assertLength } from "./assertLength.js";
import { ChatMessage } from "./ChatMessage.js";

export class ListInGameEmailsMessage extends ChatMessage {
	userId: number;
	lastEmailId: number;

	constructor(messageId: number, messageLength: number, payload: Buffer) {
		super(messageId, messageLength, payload);

		this.userId = payload.readUInt32BE(0);
		this.lastEmailId = payload.readUInt32BE(4);
	}

	static override fromBuffer(buffer: Buffer): ListInGameEmailsMessage {
		const messageId = buffer.readUInt16BE(0);
		const messageLength = buffer.readUInt16BE(2);

		assertLength(buffer.byteLength, messageLength);

		const payload = buffer.subarray(4, 4 + messageLength);

		return new ListInGameEmailsMessage(messageId, messageLength, payload);
	}

	override toString(): string {
		return `ListInGameEmailsMessage: userId=${this.userId}, lastEmailId=${this.lastEmailId}`;
	}
}
