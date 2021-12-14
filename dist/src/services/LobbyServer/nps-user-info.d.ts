/// <reference types="node" />
import { EMessageDirection } from '../MCOTS/message-node';
import { NPSMessage } from '../MCOTS/nps-msg';
/**
 * @module NPSUserInfo
 */
/**
 * @class
 * @extends {NPSMsg}
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
     * @param {MESSAGE_DIRECTION} direction
     */
    constructor(direction: EMessageDirection);
    /**
     *
     * @param {Buffer} rawData
     * @return {NPSUserInfo}
     */
    deserialize(rawData: Buffer): NPSUserInfo;
    /**
     * @return {void}
     */
    dumpInfo(): void;
}
