/// <reference types="node" />
import { ITCPHeader } from "./interfaces.js";
import { SerializerBase } from "./SerializerBase.js";
export declare class TCPHeader extends SerializerBase implements ITCPHeader {
    msgid: number;
    msglen: number;
    version: number;
    reserved: number;
    checksum: number;
    constructor();
    /**
     *
     * @param {Buffer} buf
     */
    deserialize(buf: Buffer): ITCPHeader;
    serialize(): Buffer;
    serializeSize(): number;
    toString(): string;
}
