/// <reference types="node" />
import { TServerLogger, TPersonaRecord, IPersonaServer } from "mcos/shared/interfaces";
import { NPSMessage } from "mcos/shared";
/**
 * Please use {@link PersonaServer.getInstance()}
 * @classdesc
 * @property {PersonaRecord[]} personaList
 */
export declare class PersonaServer implements IPersonaServer {
    /**
     *
     *
     * @static
     * @type {PersonaServer}
     * @memberof PersonaServer
     */
    static _instance: PersonaServer;
    /** @type {TServerLogger} */
    private readonly _log;
    /**
     * PLease use getInstance() instead
     * @author Drazi Crendraven
     * @param {TServerLogger} log
     * @memberof PersonaServer
     */
    constructor(log: TServerLogger);
    /**
     * Return the instance of the Persona Server class
     * @param {TServerLogger} log
     * @returns {PersonaServer}
     */
    static getInstance(log: TServerLogger): PersonaServer;
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
     * Lookup all personas owned by the customer id
     *
     * TODO: Store in a database, instead of being hard-coded
     *
     * @param {number} customerId
     * @return {Promise<PersonaRecord[]>}
     */
    getPersonasByCustomerId(customerId: number): Promise<TPersonaRecord[]>;
    /**
     * Handle a get persona maps packet
     * @param {Buffer} data
     * @return {Promise<NPSMessage>}
     */
    getPersonaMaps(data: Buffer): Promise<NPSMessage>;
}
/**
 * Return the instance of the Persona Server class
 * @param {TServerLogger} log
 * @returns {PersonaServer}
 */
export declare function getPersonaServer(log: TServerLogger): PersonaServer;
