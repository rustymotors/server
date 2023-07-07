/// <reference types="node" />
import { NPSMessage } from "mcos/shared";
import { TPersonaRecord } from "mcos/shared/interfaces";
/**
 *
 * @class
 * @extends {NPSMessage}
 * @property {PersonaRecord[]} personas
 * @property {number} personaSize
 * @property {number} personaCount
 */
export declare class NPSPersonaMapsMessage extends NPSMessage {
    /**
     *
     * @type {TPersonaRecord[]}
     * @memberof NPSPersonaMapsMessage
     */
    personas: TPersonaRecord[];
    personaSize: number;
    personaCount: number;
    /**
     *
     * @param {"sent" | "received"} direction
     */
    constructor(direction: "sent" | "received");
    /**
     *
     * @param {PersonaRecord[]} personas
     * @return {void}
     */
    loadMaps(personas: TPersonaRecord[]): void;
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
     * @memberof! NPSPersonaMapsMsg
     */
    deserializeString(buf: Buffer): string;
    /**
     *
     * @return {Buffer}
     */
    serialize(): Buffer;
}
