import { assertLength } from "./assertLength.js";
import { ChatMessage } from "./ChatMessage.js";
import { writeShortBooleanBE } from "./writeShortBoolean.js";
import { writeZeroTerminatedString } from "./writeZeroTerminatedString.js";

export class InGameEmailMessage extends ChatMessage {
	mailId: number;
	senderId: number;
	senderName: string;
	title: string;
	sendTime: number;
	expireTime: number;
	isUnread: boolean;
	body: string;

	/**
	 * Constructs an instance of InGameEmailMessage.
	 *
	 * @param mailId - The unique identifier for the email.
	 * @param senderId - The unique identifier for the sender.
	 * @param senderName - The name of the sender.
	 * @param title - The title of the email.
	 * @param sendTime - The timestamp when the email was sent.
	 * @param expireTime - The timestamp when the email will expire.
	 * @param isUnread - A boolean indicating if the email is unread.
	 * @param body - The body content of the email.
	 */
	constructor({
		mailId,
		senderId,
		senderName,
		title,
		sendTime,
		expireTime,
		isUnread,
		body,
	}: {
		mailId: number;
		senderId: number;
		senderName: string;
		title: string;
		sendTime: number;
		expireTime: number;
		isUnread: boolean;
		body: string;
	}) {
		super(0x619, 0, Buffer.alloc(0));

		this.mailId = mailId;
		this.senderId = senderId;
		this.senderName = senderName;
		this.title = title;
		this.sendTime = sendTime;
		this.expireTime = expireTime;
		this.isUnread = isUnread;
		this.body = body;
	}

	updateMessageLength(): void {
		this.messageLength =
			4 + // Header
			4 + // mailId
			4 + // senderId
			this.senderName.length +
			1 + // senderName
			1 + // Not known why this is needed
			this.title.length +
			1 + // title
			4 + // sendTime
			4 + // expireTime
			2 + // isUnread
			2 +
			this.body.length; // body
	}

	override toBuffer(): Buffer {
		this.updateMessageLength();
		const buffer = Buffer.alloc(this.messageLength);

		buffer.writeUInt16BE(this.messageId, 0);
		buffer.writeUInt16BE(this.messageLength, 2);

		buffer.writeInt32BE(this.mailId, 4);
		buffer.writeInt32BE(this.senderId, 8);

		let offset = writeZeroTerminatedString(buffer, 12, this.senderName);

		offset++;

		offset = writeZeroTerminatedString(buffer, offset, this.title);

		buffer.writeUInt32BE(this.sendTime, offset);
		offset += 4;
		buffer.writeUInt32BE(this.expireTime, offset);
		offset += 4;
		writeShortBooleanBE(buffer, offset, this.isUnread);
		offset += 2;
		buffer.writeUInt16BE(this.body.length, offset);
		offset += 2;
		buffer.write(this.body, offset);

		assertLength(buffer.byteLength, this.messageLength);

		return buffer;
	}

	override toString(): string {
		return "".concat(
			`InGameEmailMessage: mailId=${this.mailId}, `,
			`senderId=${this.senderId}, `,
			`senderName=${this.senderName}, `,
			`title=${this.title}, `,
			`sendTime=${this.sendTime.toFixed(0)}, `,
			`expireTime=${this.expireTime.toFixed(0)}, `,
			`isUnread=${this.isUnread}, `,
			`body=${this.body}`,
		);
	}
}
