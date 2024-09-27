import { assertLength } from "./assertLength.js";
import { bufferToHexString } from "./toHexString.js";

export class ChatMessage {
	messageId: number;
	messageLength: number;
	payload: Buffer;

	constructor(messageId: number, messageLength: number, payload: Buffer) {
		this.messageId = messageId;
		this.messageLength = messageLength;
		this.payload = payload;
	}

	static fromBuffer(buffer: Buffer): ChatMessage {
		const messageId = buffer.readUInt16BE(0);
		const messageLength = buffer.readUInt16BE(2);

		assertLength(buffer.byteLength, messageLength);

		const payload = buffer.subarray(4, 4 + messageLength);

		return new ChatMessage(messageId, messageLength, payload);
	}

	toBuffer(): Buffer {
		const buffer = Buffer.alloc(this.messageLength);

		buffer.writeUInt16BE(this.messageId, 0);
		buffer.writeUInt16BE(this.messageLength, 2);
		this.payload.copy(buffer, 4);

		return buffer;
	}

	toString(): string {
		return `ChatMessage(${this.messageId}, ${this.messageLength}, ${bufferToHexString(this.payload)})`;
	}
}
