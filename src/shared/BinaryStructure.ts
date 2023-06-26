// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { FIELD_TYPE, TServerLogger } from "./interfaces.js";
import { Sentry } from "./sentry.js";

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
    constructor(newField: ByteField) {
        this.name = newField.name;
        this.order = newField.order;
        this.offset = newField.offset;
        this.size = newField.size;
        this.type = newField.type;
        this.value = newField.value;
    }
}

export class BinaryStructureBase {
    /**
     * Holds the next offset to be used when adding a field
     * @protected
     */
    _byteOffset = 0;
    /**
     * Total byteLength of all _fields
     * @protected
     */
    _byteLength = 0;
    /**
     * @protected
     * @type {ByteField[]}
     */
    _fields: ByteField[] = [];

    /** @type {TServerLogger} */
    #log: TServerLogger;

    /**
     * Creates an instance of BinaryStructure.
     * @author Drazi Crendraven
     * @param {TServerLogger} log
     */
    constructor(log: TServerLogger) {
        this.#log = log;
        // log("debug", "new BinaryStructure");
    }

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
    }) {
        const newField = { ...field, offset: this._byteOffset };
        // this.#log("debug", `Adding ${JSON.stringify(newField)}`);
        this._fields.push(newField);
        this._byteLength = this._byteLength + field.size;
        this._byteOffset = this._byteOffset + field.size;
    }

    /**
     *
     * Return the internal fields
     * @return {Buffer}
     * @memberof BinaryStructure
     */
    serialize(): Buffer {
        let responseBuffer = Buffer.alloc(0);
        this._fields.forEach((f) => {
            responseBuffer = Buffer.concat([responseBuffer, f.value]);
        });
        return responseBuffer;
    }

    /**
     * Load the internal fields
     * @param {Buffer} byteStream
     * @memberof BinaryStructure
     */
    deserialize(byteStream: Buffer) {
        if (byteStream.byteLength > this._byteLength) {
            const err = new Error(
                "There are not enough fields to hold the bytestream. " +
                    "Please slice() the input if you are using part."
            );

            throw err;
        }

        this.#log(
            "debug",
            `Attempting to deserialize ${byteStream.byteLength} bytes into ${this._fields.length} fields for a total of ${this._byteLength} bytes`
        );

        this._fields.forEach((f) => {
            // this.#log("debug", `Before: ${JSON.stringify(f)}`);
            const indexes = { start: f.offset, end: f.offset + f.size };
            // this.#log("debug", `Taking data: ${JSON.stringify(indexes)}`);
            const value = byteStream.subarray(indexes.start, indexes.end);
            // this.#log(
            //     "debug",
            //     `Setting ${f.name} with value of ${toHex(value)}, size ${
            //         value.byteLength
            //     }`
            // );
            f.value = value;
            // this.#log("debug", `After: ${JSON.stringify(f)}`);
            this._byteOffset = indexes.end;
        });
    }

    /**
     *
     * @returns {number}
     */
    getByteLength(): number {
        return this._byteLength;
    }

    /**
     * Return field by name
     * @param {string} fieldName
     * @return {ByteField}
     * @memberof BinaryStructure
     */
    get(fieldName: string): ByteField {
        const selectedField = this._fields.find((f) => {
            return f.name === fieldName;
        });
        if (typeof selectedField === "undefined") {
            throw new Error(`No field found with name: ${fieldName}`);
        }
        return selectedField;
    }

    /**
     *
     *
     * @param {string} fieldName
     * @returns {string | number | boolean}
     * @memberof BinaryStructure
     */
    getValue(fieldName: string): string | number | boolean {
        // this.#log("debug", "Calling get() in BinaryStructure..");
        const selectedField = this.get(fieldName);
        // this.#log("debug", "Calling get() in BinaryStructure.. success");
        const { type, order, value } = selectedField;
        // this.#log(
        //     "debug",
        //     `Getting a value of ${toHex(value)} from the ${
        //         selectedField.name
        //     } field with type of ${type} and size of (${value.byteLength},${
        //         selectedField.size
        //     })`
        // );
        try {
            if (type === "boolean") {
                return value.readInt8() === 0;
            }
            if (type === "char") {
                return value.toString("utf8");
            }
            if (type === "u16") {
                if (order === "big") {
                    return value.readUInt16BE();
                }
                return value.readUInt16LE();
            }
            if (type === "u32") {
                if (order === "big") {
                    return value.readUInt32BE();
                }
                return value.readUInt32LE();
            }
            return value.readUInt8();
        } catch (error) {
            Sentry.captureException(error);
            this.#log("debug", "Calling get() in BinaryStructure.. fail!");
            const err = new Error(
                `Error in getValueX: ${String(
                    error
                )}: ${fieldName}, ${type}, ${order}, ${selectedField.size}, ${
                    value.byteLength
                }, ${value}`
            );
            throw err;
        }
    }

    /**
     *
     * @param {string} fieldName
     * @param {number} newValue
     * @returns {void}
     */
    setValueNumber(fieldName: string, newValue: number) {
        // this.#log("debug", "Calling setValueNumber() in BinaryStructure..");
        const selectedField = this.get(fieldName);
        // this.#log("debug", "Calling get() in BinaryStructure.. success");
        const { type, order, value } = selectedField;
        // this.#log(
        //     "debug",
        //     `Setting a value of ${newValue} to the ${selectedField.name} field with type of ${type})`
        // );
        try {
            if (type === "boolean") {
                if (newValue === 1 || newValue === 0) {
                    value.writeInt8(newValue);
                    return;
                }
                const err = new Error(
                    "Value must be 0 or 1 for a boolean type"
                );
                throw err;
            }
            if (type === "u16") {
                if (order === "big") {
                    value.writeUInt16BE(newValue);
                    return;
                }
                value.writeUInt16LE(newValue);
                return;
            }
            if (type === "u32") {
                if (order === "big") {
                    value.writeUInt32BE(newValue);
                    return;
                }
                value.writeUInt32LE(newValue);
                return;
            }
            const err = new Error(
                `${selectedField.name} is not a number. It is type ${selectedField.type}`
            );
            throw err;
        } catch (error) {
            Sentry.captureException(error);
            const err = new Error(
                `Error in newValueNumber: ${String(
                    error
                )}: ${fieldName}, ${type}, ${order}, ${selectedField.size}, ${
                    value.byteLength
                }, ${newValue}`
            );
            throw err;
        }
    }

    /**
     *
     *
     * @author Drazi Crendraven
     * @returns {string}
     * @memberof BinaryStructure
     */
    toString(): string {
        return JSON.stringify(this._fields);
    }
}
