/**
 * @module mcos-structures
 */

/**
 *
 *
 * @author Drazi Crendraven
 */
export class BaseStructure {
    /**
     *
     *
     * @author Drazi Crendravenjs
     * @param {Buffer} _inputBuffer
     */
    // eslint-disable-next-line no-unused-vars
    deserialize(_inputBuffer) {
        throw new Error("Not implemented");
    }

    /**
     *
     *
     * @author Drazi Crendraven
     * @template T extends TBaseStructure
     * @this {T}
     * @returns {T}
     */
    serialize() {
        throw new Error("Not implemented");
    }
}

/** */
