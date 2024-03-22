/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {Buffer} data
 * @property {Buffer} data2
 * @property {string} serviceName
 */
/// <reference types="node" />
import { MessageNode } from "@rustymotors/shared";
export declare class GenericRequestMessage extends MessageNode {
    data2: Buffer;
    /**
     *
     */
    constructor();
    /**
     * @override
     * @param {Buffer} buffer
     */
    deserialize(buffer: Buffer): void;
    /**
     * @override
     * @return {Buffer}
     */
    serialize(): Buffer;
    /**
     * @override
     */
    toString(): string;
}
