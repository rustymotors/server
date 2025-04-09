import { BinaryMember, Uint16_t, Uint8_tArray } from "./BinaryMember.js";

export class GameMessage extends BinaryMember {
    private _messageId: Uint16_t = new Uint16_t();
    // The length of the message data, including the message ID and length fields
    private _messageLength: Uint16_t = new Uint16_t();
    private _messageData: Uint8_tArray = new Uint8_tArray(2048);

    constructor() {
        super();
        this._messageLength.setShort(2048);
    }

    override deserialize(v: Uint8Array): void {
        if (v.length < this.size()) {
            throw new Error(
                `GameMessage must be at least ${this.size()} bytes long, got ${v.length}`,
            );
        }

        this._messageId.set(v.slice(0, 2));
        this._messageLength.set(v.slice(2, 4));
        this._messageData.set(v.slice(4, 2052));

        // Trim the message data to the actual message length
        const messageLength = this._messageLength.getShort();
        this._messageData.set(this._messageData.get().slice(0, messageLength - 4));
    }

    override serialize(): Buffer {
        return Buffer.concat([
            this._messageId.get(),
            this._messageLength.get(),
            this._messageData.get(),
        ]);
    }

    override size(): number {
        return this._messageLength.getShort("BE");
    }

    setMessageId(messageId: number): void {
        this._messageId.setShort(messageId, "BE");
    }

    getMessageId(): number {
        return this._messageId.getShort("BE");
    }

    setMessageData(data: Uint8Array): void {
        this._messageData.set(data);
        this._messageLength.setShort(data.length + 4, "BE");
    }

    getMessageData(): Uint8Array {
        return this._messageData.get();
    }

    override toHexString(): string {
        return this.serialize().toString("hex");
    }
}

