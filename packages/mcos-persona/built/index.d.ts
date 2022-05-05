/**
 * Selects a game persona and marks it as in use
 * @param {NPSMessage} requestPacket
 * @returns {Promise<NPSMessage>}
 */
export function handleSelectGamePersona(requestPacket: NPSMessage): Promise<NPSMessage>;
/**
 * Entry and exit point for the persona service
 *
 * @export
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {Promise<import('mcos-shared/types').GServiceResponse>}
 */
export function receivePersonaData(dataConnection: import('mcos-shared/types').BufferWithConnection): Promise<import('mcos-shared/types').GServiceResponse>;
/**
 * Please use {@link PersonaServer.getInstance()}
 * @classdesc
 * @property {IPersonaRecord[]} personaList
 */
export class PersonaServer {
    /**
     *
     *
     * @static
     * @type {PersonaServer}
     * @memberof PersonaServer
     */
    static _instance: PersonaServer;
    /**
     * Return the instance of the Persona Server class
     * @returns {PersonaServer}
     */
    static getInstance(): PersonaServer;
    /**
     * Create a new game persona record
     *
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     * @memberof PersonaServer
     */
    createNewGameAccount(data: Buffer): Promise<NPSMessage>;
    /**
     * Log out a game persona
     *
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     * @memberof PersonaServer
     */
    logoutGameUser(data: Buffer): Promise<NPSMessage>;
    /**
     * Handle a check token packet
     *
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     * @memberof PersonaServer
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
     * @param {import('node:net').Socket} socket
     * @param {NPSMessage} packet
     * @return {void}
     * @memberof PersonaServer
     */
    sendPacket(socket: import('node:net').Socket, packet: NPSMessage): void;
    /**
     *
     * @param {number} customerId
     * @return {Promise<import("mcos-shared/types").PersonaRecord[]>}
     */
    getPersonasByCustomerId(customerId: number): Promise<import("mcos-shared/types").PersonaRecord[]>;
    /**
     * Lookup all personas owned by the customer id
     *
     * TODO: Store in a database, instead of being hard-coded
     *
     * @param {number} customerId
     * @return {Promise<import("mcos-shared/types").PersonaRecord[]>}
     */
    getPersonaMapsByCustomerId(customerId: number): Promise<import("mcos-shared/types").PersonaRecord[]>;
    /**
     * Handle a get persona maps packet
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     */
    getPersonaMaps(data: Buffer): Promise<NPSMessage>;
    /**
     * Handle inbound packets for the persona server
     *
     * @param {{connection: import("mcos-shared").TCPConnection, data: Buffer}} rawPacket
     * @return {Promise<import("mcos-shared").TCPConnection>}
     * @memberof PersonaServer
     */
    dataHandler(rawPacket: {
        connection: import("mcos-shared").TCPConnection;
        data: Buffer;
    }): Promise<import("mcos-shared").TCPConnection>;
}
export { getPersonasByPersonaId } from "./internal.js";
import { NPSMessage } from "mcos-shared/types";
//# sourceMappingURL=index.d.ts.map