import { NPSMessage } from 'rusty-motors-shared';
import {BytableFieldTypes, BytableHeader, BytableObject, type IBytableMessage} from "@rustymotors/binary"
import assert from 'node:assert';

export class NPSMessageToBytableMessageAdaptor implements IBytableMessage {
    deserialize(buffer: Buffer): void {
        this.npsMessage_.deserialize(buffer);
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    get header(): BytableHeader {
        throw new Error('Method not implemented.');
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    get serializeSize(): number {
        throw new Error('Method not implemented.');
    }
    serialize(): Buffer<ArrayBuffer> {
        throw new Error('Method not implemented.');
    }
    get json(): {
        name: string;
        serializeSize: number;
        header: {
            name: string;
            id: number;
            len: number;
            version: 0 | 1;
            serializeSize: number;
        };
        fields: Record<string, unknown>[];
    } {
        throw new Error('Method not implemented.');
    }
    setName(_name: string): void {
        throw new Error('Method not implemented.');
    }
    toString(): string {
        throw new Error('Method not implemented.');
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    setSerializeOrder(
        _serializeOrder: Array<{ name: string; field: keyof typeof BytableFieldTypes }>,
    ): void {
        throw new Error('Method not implemented.');
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    getField(_name: string): BytableObject | undefined {
        throw new Error('Method not implemented.');
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    getFieldValueByName(
        _name: string,
    ): string | number | Buffer<ArrayBufferLike> | undefined {
        throw new Error('Method not implemented.');
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    htonl(_value: number): Buffer<ArrayBuffer> {
        throw new Error('Method not implemented.');
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    coerceValue(_value: string | number | Buffer): Buffer<ArrayBufferLike> {
        throw new Error('Method not implemented.');
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    setFieldValueByName(_name: string, _value: string | number | Buffer): void {
        throw new Error('Method not implemented.');
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    setVersion(_version: 0 | 1): void {
        throw new Error('Method not implemented.');
    }
    getBody(): Buffer<ArrayBuffer> {
        return this.npsMessage_.data as Buffer<ArrayBuffer>
    }
    setBody(buffer: Buffer): void {
        this.npsMessage_.data = buffer
        this.npsMessage_._header.length = this.npsMessage_._header._size + buffer.length
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    get data(): Buffer<ArrayBufferLike> {
        return this.npsMessage_.data
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    set data(buffer: Buffer<ArrayBufferLike>) {
        this.npsMessage_.data = buffer
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    toHexString(): string {
        throw new Error('Method not implemented.');
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    _doDeserialize(buf: Buffer): void {
        this.npsMessage_.deserialize(buf)
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    _doSerialize(): Buffer<ArrayBuffer> {
        return this.npsMessage_.serialize()
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    get name(): string {
        throw new Error('Method not implemented.');
    }
    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    get value(): string | number | Buffer<ArrayBufferLike> {
        throw new Error('Method not implemented.');
    }

    /**
     * @deprecated // TODO: Remove depreciated method
     *
     */
    setValue(_value: string | number | Buffer): void {
        throw new Error('Method not implemented.');
    }
    private npsMessage_: NPSMessage;

    constructor(version: 1 = 1) {
        this.npsMessage_ = new NPSMessage();
        assert(version === 1);
    }
}
