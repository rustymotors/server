/**
 * @module mcos-structures
 * @requires module:Structure.TBaseStructure

/**
 *
 *
 * @author Drazi Crendraven
 */
export abstract class BaseStructure {
    /**
     *
     *
     * @author Drazi Crendravenjs
     * @param {Buffer} inputBuffer
     * @memberof BaseStructure
     */
    deserialize(inputBuffer: Buffer) {
        // This is intentional
    }

    /**
     *
     *
     * @author Drazi Crendraven
     * @template T extends TBaseStructure
     * @this {T}
     * @returns {T}
     * @memberof BaseStructure
     */
    // serialize() {
    //     return this
    // }
}

/** */
