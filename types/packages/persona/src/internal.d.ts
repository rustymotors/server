/// <reference types="node" resolution-mode="require"/>
import { Logger } from "pino";
import { PersonaRecord, GameMessage, ServiceArgs, MessageArrayWithConnectionInfo } from "../../interfaces/index.js";
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
export declare const personaRecords: PersonaRecord[];
/**
 *
 * @param {number} id
 * @return {Promise<PersonaRecord[]>}
 */
export declare function getPersonasByPersonaId(id: number): Promise<PersonaRecord[]>;
/**
 * Selects a game persona and marks it as in use
 * @param {NPSMessage} requestPacket
 * @param {TServerLogger} log
 * @returns {Promise<NPSMessage>}
 */
export declare function handleSelectGamePersona(requestPacket: GameMessage, log: Logger): Promise<GameMessage>;
/**
 *
 *
 * @param {TBufferWithConnection} dataConnection
 * @param {TServerLogger} log
 * @return {Promise<TMessageArrayWithConnection>}
 */
export declare function handleData(args: ServiceArgs): Promise<MessageArrayWithConnectionInfo>;
//# sourceMappingURL=internal.d.ts.map