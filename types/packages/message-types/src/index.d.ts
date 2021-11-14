/// <reference types="node" />
/**
 * @module
 */
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
export class ClientConnectMessage {
    /**
     *
     * @param {Buffer} buffer
     */
    constructor(buffer: Buffer);
    msgNo: number;
    personaId: number;
    appId: number;
    customerId: number;
    custName: string;
    personaName: string;
    mcVersion: Buffer;
    /**
     *
     * @return {number}
     */
    getAppId(): number;
    /**
     * DumpPacket
     * @return {string}
     */
    dumpPacket(): string;
}
/**
 *
 * @class
 * @extends {NPSMessage}
 * @property {PersonaRecord[]} personas
 * @property {number} personaSize
 * @property {number} personaCount
 */
export class NPSPersonaMapsMessage extends NPSMessage {
    personas: any[];
    personaSize: number;
    personaCount: number;
    /**
     *
     * @param {import("../../persona/src/types").PersonaRecord[]} personas
     */
    loadMaps(personas: import("../../persona/src/types").PersonaRecord[]): void;
    /**
     *
     * @param {Buffer} buf
     * @return {number}
     */
    deserializeInt8(buf: Buffer): number;
    /**
     *
     * @param {Buffer} buf
     * @return {number}
     */
    deserializeInt32(buf: Buffer): number;
    /**
     *
     * @param {Buffer} buf
     * @return {string}
     */
    deserializeString(buf: Buffer): string;
}
/**
 * @class
 * @extends {NPSMessage}
 * @property {number} userId
 * @property {Buffer} userName
 * @property {Buffer} userData
 */
export class NPSUserInfo extends NPSMessage {
    userId: number;
    userName: Buffer;
    userData: Buffer;
    /**
     * @return {string}
     */
    dumpInfo(): string;
}
/**
 *
 * @class
 * @extends {NPSMessage}
 * @property {string} sessionkey
 * @property {number} opCode
 * @property {string} contextId
 * @property {Buffer} buffer
 */
export class NPSUserStatus extends NPSMessage {
    /**
     *
     * @param {Buffer} packet
     */
    constructor(packet: Buffer);
    sessionkey: string;
    opCode: number;
    contextId: string;
    buffer: Buffer;
    /**
     * Load the RSA private key
     *
     * @param {string} privateKeyPath
     * @return {string}
     */
    fetchPrivateKeyFromFile(privateKeyPath: string): string;
    /**
     * ExtractSessionKeyFromPacket
     *
     * Take 128 bytes
     * They are the utf-8 of the hex bytes that are the key
     *
     * @param {import("../../config/src/index").AppConfiguration["certificate"]} serverConfig
     * @param {Buffer} packet
     */
    extractSessionKeyFromPacket(serverConfig: import("../../config/src/index").AppConfiguration["certificate"], packet: Buffer): void;
}
/**
 * This is the response packet sent on the login port in response to a UserLogin
 *
 * @return {Buffer}
 */
export function premadeLogin(): Buffer;
import { Buffer } from "buffer";
import { NPSMessage } from "./npsMessage.js";
