import { BytableHeader } from './BytableHeader.js';
import { BytableFieldTypes } from './BytableMessage.js';

/**
 * A field that can be serialized and deserialized
 */
export interface Field {
    /**
     * The name of the field
     */
    name: string;
    /**
     * The size of the field when serialized
     */
    get serializeSize(): number;
    /**
     * Serialize the field into a buffer
     */
    serialize(): Buffer;
    /**
     * Deserialize the field from a buffer
     * @param buffer The buffer to deserialize from
     */
    deserialize(buffer: Buffer): void;
}

export interface BytableObject {
    serialize(): Buffer;
    deserialize(buffer: Buffer): void;
    json: Record<string, unknown>;
    toString(): string;
    get serializeSize(): number;
    get name(): string;
    get value(): string | number | Buffer;
    setName(name: string): void;
    setValue(value: string | number | Buffer): void;
}
export interface IBytableMessage {
    deserialize(buffer: Buffer): void;
    get header(): BytableHeader;
    get serializeSize(): number;
    serialize(): Buffer<ArrayBuffer>;
    get json(): { name: string; serializeSize: number; header: { name: string; id: number; len: number; version: 0 | 1; serializeSize: number; }; fields: Record<string, unknown>[]; };
    setName(name: string): void;
    toString(): string;
    setSerializeOrder(serializeOrder: Array<{
        name: string;
        field: keyof typeof BytableFieldTypes;
    }>): void;
    getField(name: string): BytableObject | undefined;
    getFieldValueByName(name: string): string | number | Buffer<ArrayBufferLike> | undefined;
    htonl(value: number): Buffer<ArrayBuffer>;
    coerceValue(value: string | number | Buffer): Buffer<ArrayBufferLike>;
    setFieldValueByName(name: string, value: string | number | Buffer): void;
    setVersion(version: 0 | 1): void;
    getBody(): Buffer<ArrayBuffer>;
    setBody(buffer: Buffer): void;
    get data(): Buffer<ArrayBufferLike>;
    set data(buffer: Buffer<ArrayBufferLike>);
    toHexString(): string;
    _doDeserialize(buf: Buffer): void;
    _doSerialize(): Buffer<ArrayBuffer>;
    get name(): string;
    get value(): string | number | Buffer<ArrayBufferLike>;
    setValue(value: string | number | Buffer): void;
}
