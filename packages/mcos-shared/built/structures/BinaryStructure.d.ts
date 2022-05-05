/**
 * @export
 * @readonly
 * @typedef {'boolean' | 'binary' | 'byte' | 'char' | 'u16' | 'u32'} FIELD_TYPE
 */
/**
 * @class
 * @property {string} name
 * @property {'big' | 'little'} order
 * @property {number} offset
 * @property {number} size
 * @property {FIELD_TYPE} type
 * @property {Buffer} value
 */
export class ByteField {
    /**
     * Creates an instance of ByteField.
     * @param {ByteField} newField
     * @memberof ByteField
     */
    constructor(newField: ByteField);
    /** @type {string} */
    name: string;
    /** @type {'big' | 'little'} */
    order: 'big' | 'little';
    /** @type {number} */
    offset: number;
    /** @type {number} */
    size: number;
    /** @type {FIELD_TYPE} */
    type: FIELD_TYPE;
    /** @type {Buffer} */
    value: Buffer;
}
export class BinaryStructure {
    /**
     * Holds the next offset to be used when adding a field
     * @protected
     */
    protected _byteOffset: number;
    /**
       * Total byteLength of all _fields
       * @protected
       */
    protected _byteLength: number;
    /**
       * @protected
       * @type {ByteField[]}
       */
    protected _fields: ByteField[];
    /**
     * Add a {@link ByteField} object to the internal fields array
     * @protected
     * @param {{name: string, order: "big" | "little", size: number, type: FIELD_TYPE, value: Buffer }} field
     * @memberof BinaryStructure
     */
    protected _add(field: {
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
    get byteLength(): number;
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
     * @memberof BinaryStructure
     */
    getValue(fieldName: string): string | number | boolean;
}
export type FIELD_TYPE = 'boolean' | 'binary' | 'byte' | 'char' | 'u16' | 'u32';
//# sourceMappingURL=BinaryStructure.d.ts.map