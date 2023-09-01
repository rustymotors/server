/// <reference types="node" />
import { PersonaRecord } from "../../interfaces/index.js";
import { NPSMessage } from "../../shared/index.js";
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
     * @type {PersonaRecord[]}
     * @memberof NPSPersonaMapsMessage
     */
    personas: PersonaRecord[];
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
    loadMaps(personas: PersonaRecord[]): void;
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
//# sourceMappingURL=NPSPersonaMapsMessage.d.ts.map