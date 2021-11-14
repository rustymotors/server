/// <reference types="node" />
/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {Buffer} data
 * @property {Buffer} data2
 */
export class GenericRequestMessage {
    msgNo: number;
    data: Buffer;
    data2: Buffer;
    /**
     *
     * @param {Buffer} buffer
     */
    deserialize(buffer: Buffer): void;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string;
}
import { Buffer } from "buffer";
