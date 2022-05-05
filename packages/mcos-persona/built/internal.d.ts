/**
 * Return string as buffer
 * @param {string} name
 * @param {number} size
 * @param {BufferEncoding} [encoding="utf8"]
 * @returns {Buffer}
 */
export function generateNameBuffer(name: string, size: number, encoding?: BufferEncoding | undefined): Buffer;
/**
   *
   * @param {number} id
   * @return {Promise<import("mcos-shared/types").PersonaRecord[]>}
   */
export function getPersonasByPersonaId(id: number): Promise<import("mcos-shared/types").PersonaRecord[]>;
/**
 * Selects a game persona and marks it as in use
 * @param {NPSMessage} requestPacket
 * @returns {Promise<NPSMessage>}
 */
export function handleSelectGamePersona(requestPacket: NPSMessage): Promise<NPSMessage>;
/**
 *
 *
 * @param {import('mcos-shared/types').BufferWithConnection} dataConnection
 * @return {Promise<import('mcos-shared/types').GSMessageArrayWithConnection>}
 */
export function handleData(dataConnection: import('mcos-shared/types').BufferWithConnection): Promise<import('mcos-shared/types').GSMessageArrayWithConnection>;
/**
 * Return a list of all personas
 * @returns {import("mcos-shared/types").PersonaRecord[]}
 */
/** @type {import("mcos-shared/types").PersonaRecord[]} */
export const personaRecords: import("mcos-shared/types").PersonaRecord[];
import { NPSMessage } from "mcos-shared/types";
//# sourceMappingURL=internal.d.ts.map