/// <reference types="node" />
/**
 * @module ClientConnectMsg
 */
/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {number} personaId
 * @property {number} appId
 * @property {number} customerId
 * @property {string} custName
 * @property {string} personaName
 * @property {Buffer} mcVersion
 */
export declare class ClientConnectMessage {
    msgNo: number;
    personaId: number;
    appId: number;
    customerId: number;
    custName: string;
    personaName: string;
    mcVersion: Buffer;
    /**
     *
     * @param {Buffer} buffer
     */
    constructor(buffer: Buffer);
    /**
     *
     * @return {number}
     */
    getAppId(): number;
    /**
     * DumpPacket
     * @return {void}
     */
    dumpPacket(): void;
}
