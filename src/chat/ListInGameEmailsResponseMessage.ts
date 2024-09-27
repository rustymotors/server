import { ChatMessage } from "./ChatMessage.js";

export class ListInGameEmailsResponseMessage extends ChatMessage {
    totalEmails: number;
    firstEmailId: number;

    constructor(numberOfEmails: number, firstEmailId: number) {
        super(0x061b, 10, Buffer.alloc(6));

        this.totalEmails = numberOfEmails;
        this.firstEmailId = firstEmailId;
    }

    override toBuffer(): Buffer {
        const buffer = Buffer.alloc(this.messageLength);

        buffer.writeUInt16BE(this.messageId, 0);
        buffer.writeUInt16BE(this.messageLength, 2);

        buffer.writeUInt16BE(this.totalEmails, 4);
        buffer.writeUInt32BE(this.firstEmailId, 6);

        return buffer;
    }

    override toString(): string {
        return `ListInGameEmailsResponseMessage: totalEmails=${this.totalEmails}, firstEmailId=${this.firstEmailId}`;
    }
}
