import type { PersonaRecord } from "../../interfaces/index.js";
/**
 *
 * @param {number} id
 * @return {Promise<import("../../interfaces/index.js").PersonaRecord[]>}
 */
export declare function getPersonasByPersonaId({
    personas,
    id,
}: {
    personas?: PersonaRecord[];
    id: number;
}): Promise<import("../../interfaces/index.js").PersonaRecord[]>;
