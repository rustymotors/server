/// <reference types="node" />
import { LegacyMessage } from "../../shared";
export declare class LoginInfoMessage extends LegacyMessage {
    _userId: number;
    _userName: string;
    _userData: Buffer;
    _customerId: number;
    _flags: number;
    _dllVersion: string;
    _hostname: string;
    _idAddress: string;
    _hashKey: Buffer;
    constructor();
    /**
     * @param {Buffer} buffer
     * @returns {LoginInfoMessage}
     */
    deserialize(buffer: Buffer): LoginInfoMessage;
    /**
     * @returns {Buffer}
     */
    serialize(): Buffer;
    toString(): string;
}
