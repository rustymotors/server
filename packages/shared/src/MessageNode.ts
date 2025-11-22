import {
    checkMinLength,
    checkSize2,
    checkSize4,
    sliceBuff,
} from './helpers.js';
import { MCOTSMessage, Serializable } from './types.js';

export class MessageNodeBody implements Serializable {
    protected body_: Buffer;

    constructor() {
        this.body_ = Buffer.alloc(4);
    }

    get sizeOf() {
        return this.body_.byteLength;
    }

    serialize() {
        return this.body_;
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, 2);
        this.body_ = buf;
    }

    get msgNumber() {
        return this.body_.readInt16LE();
    }

    set msgNumber(val: number) {
        checkSize2(val);
        this.body_.writeInt16LE(val);
    }
}

export class MessageNode implements MCOTSMessage {
    protected connectionId_: string;
    protected msgLength_: number; // 2
    protected signature_: string; // 4
    protected sequence_: number; // 4
    protected flags_: number; // 1
    protected body_: MessageNodeBody;

    constructor() {
        this.connectionId_ = '';
        this.msgLength_ = 0;
        this.signature_ = 'TOMC';
        this.sequence_ = 0;
        this.flags_ = 0;
        this.body_ = new MessageNodeBody();
    }

    get sizeOf() {
        return 11 + this.body_.sizeOf;
    }

    serialize() {
        checkSize4(this.signature_.length);
        this.msgLength_ = 9 + this.body_.sizeOf;
        const buf = Buffer.alloc(this.sizeOf);
        let offset = 0;
        buf.writeUInt16LE(this.msgLength_, offset);
        offset = offset + 2;
        buf.write(this.signature_, offset, 'utf8');
        offset = offset + 4;
        buf.writeInt32LE(this.sequence_, offset);
        offset = offset + 4;
        buf.writeInt8(this.flags_, offset);
        offset = offset + 1;
        this.body_.serialize().copy(buf, offset);
        return buf;
    }

    deserialize(buf: Buffer) {
        checkMinLength(buf, 11);
        let offset = 0;
        this.msgLength_ = buf.readUInt16LE(offset);
        offset = offset + 2;
        this.signature_ = sliceBuff(buf, offset, 4).toString('utf8');
        offset = offset + 4;
        this.sequence_ = buf.readInt32LE(offset);
        offset = offset + 4;
        this.flags_ = buf.readInt8(offset);
        offset = offset + 1;
        this.body_.deserialize(buf.subarray(offset));
    }

    get connectionId() {
        return this.connectionId_;
    }

    set connectionId(val: string) {
        this.connectionId_ = val;
    }

    get length() {
        return this.msgLength_;
    }

    isSignatureValid() {
        return this.signature_ === 'TOMC';
    }

    get signature() {
        return this.signature_;
    }

    get sequence() {
        return this.sequence_;
    }

    set sequence(val: number) {
        this.sequence_ = val;
    }

    isSequenceSet() {
        return this.sequence_ !== 0;
    }

    get flags() {
        return this.flags_;
    }

    isPayloadEncrypted(): boolean {
        // Does the flags bitmask contain have 0x08 set?
        return (this.flags_ & 0x08) != 0;
    }

    isPayloadCompressed(): boolean {
        return (this.flags_ & 0x02) != 0;
    }

    setPayloadEncryption(encrypted: boolean): void {
        if (encrypted) {
            this.flags_ |= 0x08;
        } else {
            this.flags_ &= ~0x08;
        }
    }

    setPayloadCompression(encrypted: boolean): void {
        if (encrypted) {
            this.flags_ |= 0x02;
        } else {
            this.flags_ &= ~0x02;
        }
    }

    getBody() {
        return this.body_;
    }

    setBody(body: MessageNodeBody) {
        this.msgLength_ = body.sizeOf;
        this.body_ = body;
    }

    get msgNo() {
        return this.body_.msgNumber;
    }

    set msgNo(val: number) {
        checkSize2(val);
        this.body_.msgNumber = val;
    }

    toString() {
        return `MessageNode: ${JSON.stringify(this)}`;
    }

    toLogString() {
        // Only log essential message node info, mask body if possible
        let bodyLog;
        if (
            this.body_ &&
            typeof (this.body_ as any).toLogString === "function"
        ) {
            bodyLog = (this.body_ as any).toLogString();
        } else {
            // fallback: attempt to mask sensitive content
            bodyLog = "<body>";
        }
        return JSON.stringify({
            sequence: this.sequence,
            flags_: this.flags_,
            msgLength_: this.msgLength_,
            body: bodyLog,
        });
    }

    // IServerMessage implementation
    get data(): Buffer {
        return this.body_.serialize();
    }

    get sequenceNumber(): number {
        return this.sequence_;
    }

    toHexString(): string {
        return this.serialize().toString('hex');
    }

    // Deprecated methods required by legacy code
    getMessageId(): number {
        return this.msgNo;
    }

    getSequence(): number {
        return this.sequence_;
    }

    getByteSize(): number {
        return this.sizeOf;
    }

    // Deprecated methods restored for compatibility
    ensureNonZeroSequence() {
        if (this.sequence === 0) {
            throw new Error("please set sequence");
        }
    }

    ensureValidSignature() {
        if (!this.isSignatureValid()) {
            throw new Error("invalid signature");
        }
    }

    get header() {
        return {
            mcoSig: this.signature,
            length: this.length,
            sequence: this.sequence,
            flags: this.flags,
        };
    }


}

