/// <reference types="node" />
export interface Serializable {
    data: Buffer;
    serialize(): Buffer;
    deserialize(buffer: Buffer): Serializable;
    length: number;
    toString(): string;
    asHex(): string;
}
/**
 * Base class for all serialized objects
 * Just a wrapper around a buffer
 */
export declare class BaseSerialized implements Serializable {
    protected _data: Buffer;
    constructor(data?: Buffer);
    get data(): Buffer;
    set data(data: Buffer);
    serialize(): Buffer;
    deserialize(buffer: Buffer): Serializable;
    get length(): number;
    toString(): string;
    asHex(): string;
}
