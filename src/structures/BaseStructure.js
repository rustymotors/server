/**
 * @module mcos/structures
 * @requires module:Structure.TBaseStructure

/**
 *
 *
 * @author Drazi Crendraven
 * @export
 * @class BaseStructure
 */
export class BaseStructure  {
    
    /**
     *
     *
     * @author Drazi Crendravenjs
     * @param {Buffer} inputBuffer
     * @memberof BaseStructure
     */
    deserialize(inputBuffer)    {}

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
