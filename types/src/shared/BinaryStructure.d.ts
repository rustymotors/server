/// <reference types="node" />
import { FIELD_TYPE, TServerLogger } from "./interfaces.js";
/**
 * @class
 * @property {string} name
 * @property {'big' | 'little'} order
 * @property {number} offset
 * @property {number} size
 * @property {FIELD_TYPE} type
 * @property {Buffer} value
 */
export declare class ByteField {
    /** @type {string} */
    name: string;
    /** @type {'big' | 'little'} */
    order: "big" | "little";
    /** @type {number} */
    offset: number;
    /** @type {number} */
    size: number;
    /** @type {FIELD_TYPE} */
    type: FIELD_TYPE;
    /** @type {Buffer} */
    value: Buffer;
    /**
     * Creates an instance of ByteField.
     * @param {ByteField} newField
     */
    constructor(newField: ByteField);
}
export declare class BinaryStructureBase {
    #private;
    /**
     * Holds the next offset to be used when adding a field
     * @protected
     */
    _byteOffset: number;
    /**
     * Total byteLength of all _fields
     * @protected
     */
    _byteLength: number;
    /**
     * @protected
     * @type {ByteField[]}
     */
    _fields: ByteField[];
    /**
     * Creates an instance of BinaryStructure.
     * @author Drazi Crendraven
     * @param {TServerLogger} log
     */
    constructor(log: TServerLogger);
    /**
     * Add a {@link ByteField} object to the internal fields array
     * @protected
     * @param {{name: string, order: "big" | "little", size: number, type: FIELD_TYPE, value: Buffer }} field
     * @memberof BinaryStructure
     */
    _add(field: {
        name: string;
        order: "big" | "little";
        size: number;
        type: FIELD_TYPE;
        value: Buffer;
    }): void;
    /**
     *
     * Return the internal fields
     * @return {Buffer}
     * @memberof BinaryStructure
     */
    serialize(): Buffer;
    /**
     * Load the internal fields
     * @param {Buffer} byteStream
     * @memberof BinaryStructure
     */
    deserialize(byteStream: Buffer): void;
    /**
     *
     * @returns {number}
     */
    getByteLength(): number;
    /**
     * Return field by name
     * @param {string} fieldName
     * @return {ByteField}
     * @memberof BinaryStructure
     */
    get(fieldName: string): ByteField;
    /**
     *
     *
     * @param {string} fieldName
     * @returns {string | number | boolean}
     * @memberof BinaryStructure
     */
    getValue(fieldName: string): string | number | boolean;
    /**
     *
     * @param {string} fieldName
     * @param {number} newValue
     * @returns {void}
     */
    setValueNumber(fieldName: string, newValue: number): void;
    /**
     *
     *
     * @author Drazi Crendraven
     * @returns {string}
     * @memberof BinaryStructure
     */
    toString(): string;
}
