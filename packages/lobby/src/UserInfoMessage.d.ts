/// <reference types="node" />
import { LegacyMessage } from "../../shared";
import { LoginInfoMessage } from "./LoginInfoMessage.js";
export declare class UserInfo {
    _userId: number;
    _userName: string;
    _userData: Buffer;
    constructor();
    deserialize(buffer: Buffer): this;
    serialize(): Buffer;
    size(): number;
}
export declare class UserInfoMessage extends LegacyMessage {
    _userId: number;
    _userName: string;
    _userData: Buffer;
    constructor();
    /**
     * @param {Buffer} buffer
     * @returns {UserInfoMessage}
     */
    deserialize(buffer: Buffer): this;
    /**
     * @returns {Buffer}
     */
    serialize(): Buffer;
    /**
     * @param {LoginInfoMessage} loginInfoMessage
     */
    fromLoginInfoMessage(loginInfoMessage: LoginInfoMessage): this;
    calculateLength(): any;
    toString(): string;
}
