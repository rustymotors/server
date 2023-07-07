/// <reference types="node" />
import { NPSMessage } from "mcos/shared";
import { TServerLogger, TMessageArrayWithConnection, TPersonaRecord, TServiceRouterArgs } from "mcos/shared/interfaces";
/**
 * Return string as buffer
 * @param {string} name
 * @param {number} size
 * @param {BufferEncoding} [encoding="utf8"]
 * @returns {Buffer}
 */
export declare function generateNameBuffer(name: string, size: number, encoding?: BufferEncoding): Buffer;
/**
 * All personas
 * @type {TPersonaRecord[]}
 */
export declare const personaRecords: TPersonaRecord[];
/**
 *
 * @param {number} id
 * @return {Promise<PersonaRecord[]>}
 */
export declare function getPersonasByPersonaId(id: number): Promise<TPersonaRecord[]>;
/**
 * Selects a game persona and marks it as in use
 * @param {NPSMessage} requestPacket
 * @param {TServerLogger} log
 * @returns {Promise<NPSMessage>}
 */
export declare function handleSelectGamePersona(requestPacket: NPSMessage, log: TServerLogger): Promise<NPSMessage>;
/**
 *
 *
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerLogger} log
 * @return {Promise<TMessageArrayWithConnection>}
 */
export declare function handleData(args: TServiceRouterArgs): Promise<TMessageArrayWithConnection>;
