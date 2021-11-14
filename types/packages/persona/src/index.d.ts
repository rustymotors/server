/// <reference types="node" />
/**
 * @module
 */
export class PersonaServer {
    /** @type {PersonaServer} */
    static _instance: PersonaServer;
    /**
     *
     * @returns {PersonaServer}
     */
    static getInstance(): PersonaServer;
    /** @type {import("./types").PersonaRecord[]} */
    personaList: import("./types").PersonaRecord[];
    /**
     * @private
     * @param {string} name
     * @returns {Buffer}
     */
    private _generateNameBuffer;
    /**
     *
     * @param {Buffer} data
     * @returns {Promise<NPSMessage>}
     */
    handleSelectGamePersona(data: Buffer): Promise<NPSMessage>;
    /**
     *
     * @param {Buffer} data
     * @returns {Promise<NPSMessage>}
     */
    createNewGameAccount(data: Buffer): Promise<NPSMessage>;
    /**
     *
     * @param {Buffer} data
     * @returns {Promise<NPSMessage>}
     */
    logoutGameUser(data: Buffer): Promise<NPSMessage>;
    /**
     * Handle a check token packet
     *
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     */
    validateLicencePlate(data: Buffer): Promise<NPSMessage>;
    /**
     * Handle a get persona maps packet
     *
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     */
    validatePersonaName(data: Buffer): Promise<NPSMessage>;
    /**
     *
     *
     * @param {import("net").Socket} socket
     * @param {NPSMessage} packet
     */
    sendPacket(socket: import("net").Socket, packet: NPSMessage): void;
    /**
     *
     * @param {number} customerId
     * @return {import("./types").PersonaRecord[]}
     */
    getPersonasByCustomerId(customerId: number): import("./types").PersonaRecord[];
    /**
     *
     * @param {number} id
     * @return {Promise<import("./types").PersonaRecord[]>}
     */
    getPersonasByPersonaId(id: number): Promise<import("./types").PersonaRecord[]>;
    /**
     * Lookup all personas owned by the customer id
     * TODO: Store in a database, instead of being hard-coded
     *
     * @param {number} customerId
     * @return {Promise<import("./types").PersonaRecord[]>}
     */
    getPersonaMapsByCustomerId(customerId: number): Promise<import("./types").PersonaRecord[]>;
    /**
     * Handle a get persona maps packet
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     */
    getPersonaMaps(data: Buffer): Promise<NPSMessage>;
    /**
     *
     * @param {import("../../transactions/src/types").UnprocessedPacket} rawPacket
     * @returns {Promise<import("../../core/src/tcpConnection").TCPConnection>}
     */
    dataHandler(rawPacket: any): Promise<import("../../core/src/tcpConnection").TCPConnection>;
}
import { Buffer } from "buffer";
import { NPSMessage } from "../../message-types/src/npsMessage.js";
