/// <reference types="node" />
import { Socket } from 'net';
import { IPersonaRecord, IRawPacket } from '../../types';
import { NPSMessage } from '../MCOTS/nps-msg';
import { TCPConnection } from '../MCServer/tcpConnection';
/**
 * @module PersonaServer
 */
/**
 * @class
 * @property {IPersonaRecord[]} personaList
 */
export declare class PersonaServer {
    static _instance: PersonaServer;
    personaList: IPersonaRecord[];
    serviceName: string;
    static getInstance(): PersonaServer;
    private constructor();
    private _generateNameBuffer;
    handleSelectGamePersona(data: Buffer): Promise<NPSMessage>;
    createNewGameAccount(data: Buffer): Promise<NPSMessage>;
    logoutGameUser(data: Buffer): Promise<NPSMessage>;
    /**
     * Handle a check token packet
     *
     * @param {Buffer} data
     * @return {Promise<NPSMsg>}
     */
    validateLicencePlate(data: Buffer): Promise<NPSMessage>;
    /**
     * Handle a get persona maps packet
     *
     * @param {Buffer} data
     * @return {Promise<NPSMsg>}
     */
    validatePersonaName(data: Buffer): Promise<NPSMessage>;
    /**
     *
     *
     * @param {Socket} socket
     * @param {NPSMsg} packet
     * @return {void}
     * @memberof PersonaServer
     */
    sendPacket(socket: Socket, packet: NPSMessage): void;
    /**
     *
     * @param {number} customerId
     * @return {Promise<IPersonaRecord[]>}
     */
    getPersonasByCustomerId(customerId: number): Promise<IPersonaRecord[]>;
    /**
     *
     * @param {number} id
     * @return {Promise<IPersonaRecord[]>}
     */
    getPersonasByPersonaId(id: number): Promise<IPersonaRecord[]>;
    /**
     * Lookup all personas owned by the customer id
     * TODO: Store in a database, instead of being hard-coded
     *
     * @param {number} customerId
     * @return {Promise<IPersonaRecord[]>}
     */
    getPersonaMapsByCustomerId(customerId: number): Promise<IPersonaRecord[]>;
    /**
     * Handle a get persona maps packet
     * @param {Buffer} data
     * @return {Promise<NPSMsg>}
     */
    getPersonaMaps(data: Buffer): Promise<NPSMessage>;
    dataHandler(rawPacket: IRawPacket): Promise<TCPConnection>;
}
