import {
    checkMinLength,
    checkSize2,
    checkSize4,
    sliceBuff,
} from './helpers.js';
import type { MCOTSMessage, Serializable } from './types.js';

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

    toString() {
        return this.body_.toString("hex")
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
        // Use unsigned 16-bit to support messages larger than 32767 bytes
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
        // Use unsigned 16-bit to match serialize() and support messages larger than 32767 bytes
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

    // TODO: change usage of these

    /**
     * @deprecated
     *
     * see {@link signature} and {@link length}
     */
    get header() {
        return {
            mcoSig: this.signature,
            length: this.length,
        };
    }

    /**
     * @deprecated
     *
     * see {@link sequence}
     */
    get seq() {
        return this.sequence;
    }

    /**
     * @deprecated
     *
     * see {@link getBody} and {@link setBody}
     */
    get data() {
        return this.body_.serialize();
    }

    /**
     * @deprecated
     */
    getDataBuffer() {
        return this.body_;
    }

    /**
     * @deprecated
     */
    setDataBuffer(val: Buffer) {
        this.body_.deserialize(val);
    }

    /**
     * @deprecated
     */
    getByteSize() {
        return 11 + this.body_.sizeOf;
    }

    /**
     * @deprecated
     */
    setSequence(val: number) {
        this.sequence_ = val;
    }

    /**
     * @deprecated
     */
    setLength(val: number) {
        this.msgLength_ = val;
    }

    /**
     * @deprecated
     */
    setSignature(val: string) {
        this.signature_ = val;
    }

    /**
     * @deprecated
     */
    getMessageId() {
        return this.msgNo;
    }

    /**
     * @deprecated
     */
    setMessageId(val: number) {
        this.setMessageId(val);
    }

    /**
     * @deprecated
     */
    getLength() {
        return this.msgLength_;
    }

    /**
     * @deprecated
     */
    getSignature() {
        return this.signature_;
    }

    /**
     * @deprecated
     */
    getSequence() {
        return this.sequence_;
    }

    /**
     * @deprecated
     */
    isValidSignature() {
        return this.isSignatureValid();
    }

    /**
     * @deprecated
     */
    ensureValidSignature() {
        if (!this.isSignatureValid()) {
            throw new Error('Signature is not valid');
        }
    }

    /**
     * @deprecated
     */
    ensureNonZeroSequence() {
        if (this.sequence_ === 0) {
            throw new Error('please set sequence');
        }
    }

    /**
     * @deprecated
     */
    get messageId() {
        return this.msgNo;
    }

    /**
     * @deprecated
     */
    get messageSource() {
        return null;
    }

    /**
     * @deprecated
     */
    get _data() {
        return this.body_;
    }

    /**
     * @deprecated
     */
    _assertEnoughData() {
        return false;
    }

    /**
     * @deprecated
     */
    _doDeserialize(_buffer?: Buffer) {}

    /**
     * @deprecated
     */

    _doSerialize() {}

    /**
     * @deprecated
     */
    toHexString() {
        return this.serialize().toString('hex');
    }

    /**
     * @deprecated
     */
    get sequenceNumber() {
        return this.sequence_
        }
    }

