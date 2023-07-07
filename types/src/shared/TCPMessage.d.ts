/// <reference types="node" />
import { ITCPHeader, ITCPMessage } from "./interfaces.js";
import { SerializerBase } from "./SerializerBase.js";
import { TCPHeader } from "./TCPHeader.js";
export declare class TCPMessage extends SerializerBase implements ITCPMessage {
    connectionId: string | null;
    toFrom: number;
    appId: number;
    _header: ITCPHeader | null;
    buffer: Buffer;
    get header(): ITCPHeader;
    set header(value: TCPHeader);
    /**
     *
     * @param {Buffer} buf
     */
    deserialize(buf: Buffer): ITCPMessage;
    constructor();
    serialize(): Buffer;
    serializeSize(): number;
    toString(): string;
}
