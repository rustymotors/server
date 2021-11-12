/// <reference types="node" />
/**
 * @export
 * @typedef {Object} PersonaRecord
 * @property {number} customerId
 * @property {Buffer} id
 * @property {Buffer} maxPersonas
 * @property {Buffer} name
 * @property {Buffer} personaCount
 * @property {Buffer} shardId
 */
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
    /** @type {PersonaRecord[]} */
    personaList: PersonaRecord[];
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
     * @param {Socket} socket
     * @param {NPSMessage} packet
     */
    sendPacket(socket: Socket, packet: NPSMessage): void;
    /**
     *
     * @param {number} customerId
     * @return {Promise<PersonaRecord[]>}
     */
    getPersonasByCustomerId(customerId: number): Promise<PersonaRecord[]>;
    /**
     *
     * @param {number} id
     * @return {Promise<PersonaRecord[]>}
     */
    getPersonasByPersonaId(id: number): Promise<PersonaRecord[]>;
    /**
     * Lookup all personas owned by the customer id
     * TODO: Store in a database, instead of being hard-coded
     *
     * @param {number} customerId
     * @return {Promise<PersonaRecord[]>}
     */
    getPersonaMapsByCustomerId(customerId: number): Promise<PersonaRecord[]>;
    /**
     * Handle a get persona maps packet
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     */
    getPersonaMaps(data: Buffer): Promise<NPSMessage>;
    /**
     *
     * @param {import("../../transactions/src/tcp-manager").UnprocessedPacket} rawPacket
     * @returns {Promise<TCPConnection}
     */
    dataHandler(rawPacket: import("../../transactions/src/tcp-manager").UnprocessedPacket): Promise<TCPConnection>;
}
export type PersonaRecord = {
    customerId: number;
    id: Buffer;
    maxPersonas: Buffer;
    name: Buffer;
    personaCount: Buffer;
    shardId: Buffer;
};
import { NPSMessage } from "../../message-types/src/index";
import { Socket } from "net";
import { TCPConnection } from "../../core/src/tcpConnection";
