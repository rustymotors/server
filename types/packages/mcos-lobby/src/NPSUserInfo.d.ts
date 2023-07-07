/// <reference types="node" />
import { NPSMessage } from "mcos/shared";
/**
 * @class NPSUserInfo
 * @extends {NPSMessage}
 * @property {number} userId
 * @property {Buffer} userName
 * @property {Buffer} userData
 */
export declare class NPSUserInfo extends NPSMessage {
    userId: number;
    userName: Buffer;
    userData: Buffer;
    /**
     *
     * @param {"sent" | "received"} direction
     */
    constructor(direction: "sent" | "received");
    /**
     *
     * @override
     * @param {Buffer} rawData
     * @return {NPSUserInfo}
     */
    deserialize(rawData: Buffer): this;
    /**
     * @return {string}
     */
    dumpInfo(): string;
}
