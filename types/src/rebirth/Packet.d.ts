/// <reference types="node" />
declare class PacketHeader {
    msgId: Buffer;
    msgLen: Buffer;
    msgVersion: Buffer;
    reserved: Buffer;
    sequence: Buffer;
    constructor();
    static fromBuffer(buffer: Buffer): PacketHeader;
    static fromHeader(header: PacketHeader): PacketHeader;
    serialize(): Buffer;
}
export declare class Packet {
    header: PacketHeader;
    constructor({ id, version }: {
        id: number;
        version: number;
    });
    serialize(): Buffer;
    deserialize(buffer: Buffer): void;
    get id(): number;
    get version(): number;
    set id(id: number);
    set version(version: number);
    get sequence(): number;
    set sequence(sequence: number);
    get length(): number;
}
export {};
