/// <reference types="node" />
/**
 * @module LoginMsg
 */
/**
 * @class
 * @property {number} newMsgNo
 * @property {number} toFrom
 * @property {number} appId
 * @property {number} customerId
 * @property {number} personaId
 * @property {number} lotOwnerId
 * @property {number} brandedPartId
 * @property {number} skinId
 * @property {string} personaName
 * @property {string} version
 * @property {Buffer} data
 * @property {Record<string, unknown>} struct
 */
export declare class LoginMessage {
    msgNo: number;
    toFrom: number;
    appId: number;
    customerId: number;
    personaId: number;
    lotOwnerId: number;
    brandedPartId: number;
    skinId: number;
    personaName: string;
    version: string;
    data: Buffer;
    /**
     *
     * @param {Buffer} buffer
     */
    constructor(buffer: Buffer);
    /**
     *
     * @param {Buffer} buffer
     * @return {void}
     */
    deserialize(buffer: Buffer): void;
    /**
     * DumpPacket
     * @return {void}
     */
    dumpPacket(): void;
}
