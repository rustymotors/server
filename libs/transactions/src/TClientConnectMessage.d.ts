/// <reference types="node" />
import { OldServerMessage } from "rusty-shared";
export declare class TClientConnectMessage extends OldServerMessage {
    _customerId: number;
    _personaId: number;
    _customerName: string;
    _personaName: string;
    _mcVersion: string;
    constructor();
    size(): number;
    /**
     * @param {Buffer} buffer
     */
    deserialize(buffer: Buffer): void;
    serialize(): Buffer;
    /**
     * @override
     */
    toString(): string;
}
