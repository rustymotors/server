import { NPSMessage } from "rusty-motors-shared";
import { PersonaRecord } from "./PersonaRecord.js";

export class PersonaList {
    _personaRecords: PersonaRecord[];
    constructor() {
        /** @type {PersonaRecord[]} */
        this._personaRecords = [];
    }

    /**
     *
     * @param {Buffer} buffer
     * @returns {PersonaList}
     */
    deserialize(buffer: Buffer): PersonaList {
        let offset = 0;
        const personaRecordCount = buffer.readUInt16BE(offset);
        offset += 2;
        for (let i = 0; i < personaRecordCount; i++) {
            const personaRecord = new PersonaRecord();
            personaRecord.deserialize(buffer.subarray(offset));
            offset += PersonaRecord.size();
            this._personaRecords.push(personaRecord);
        }
        return this;
    }

    /**
     *
     * @returns {Buffer}
     */
    serialize(): Buffer {
        const NEEDED_SIZE = PersonaRecord.size() * this._personaRecords.length;
        const buffer = Buffer.alloc(NEEDED_SIZE);
        try {
            let offset = 0;
            if (!this._personaRecords) {
                throw Error("PersonaRecords is undefined");
            }
            for (const personaRecord of this._personaRecords) {
                personaRecord.serialize().copy(buffer, offset);
                offset += PersonaRecord.size();
            }
        } catch (error) {
            throw Error(
                `Error serializing PersonaList buffer: ${String(error)}`,
            );
        }
        return buffer;
    }

    /**
     * @param {PersonaRecord} personaRecord
     */
    addPersonaRecord(personaRecord: PersonaRecord) {
        this._personaRecords.push(personaRecord);
    }

    personaCount() {
        return this._personaRecords.length;
    }

    size() {
        return PersonaRecord.size() * this._personaRecords.length;
    }

    asJSON() {
        return {
            personaRecords: this._personaRecords,
        };
    }

    toString() {
        return `PersonaList: ${JSON.stringify(this._personaRecords)}`;
    }
}
export class PersonaMapsMessage extends NPSMessage {
    _personaRecords: PersonaList | undefined;
    raw: Buffer | undefined;
    constructor() {
        super();
        /** @type {PersonaList | undefined} */
        this._personaRecords = undefined;
    }

    /**
     * @param {Buffer} buffer
     * @returns {PersonaMapsMessage}
     */
    override deserialize(buffer: Buffer): PersonaMapsMessage {
        try {
            this._header._doDeserialize(buffer);
            this.setBuffer(buffer.subarray(12)); // 12 = NPSHeader size (version 1 header)
            this.raw = buffer;
            return this;
        } catch (error) {
            const err = Error(
                `Error deserializing PersonaMapsMessage: ${String(error)}`,
            );
            err.cause = error;
            throw err;
        }
    }

    /**
     * @returns {Buffer}
     */
    override serialize() {
        try {
            if (!this._personaRecords) {
                throw Error("PersonaRecords is undefined");
            }
            this._header.length = 12 + 2 + this._personaRecords.size(); // 12 = header size, 2 = persona count
            const buffer = Buffer.alloc(this._header.length);
            this._header._doSerialize().copy(buffer);

            // Write the persona count. This is known to be correct at offset 12
            buffer.writeUInt16BE(this._personaRecords.personaCount(), 12);
            // This is a serialized PersonaList
            this.data.copy(buffer, 12 + 2); // 12 = header size, 2 = persona count
            return buffer;
        } catch (error) {
            const err = Error(
                `Error serializing PersonaMapsMessage: ${String(error)}`,
            );
            err.cause = error;
            throw err;
        }
    }

    asJSON() {
        return {
            header: this._header,
            personaRecords: this._personaRecords,
        };
    }

    override toString() {
        return `PersonaMapsMessage: ${JSON.stringify({
            header: this._header,
            personaRecords: this._personaRecords,
        })}`;
    }
}

/**
 * Serializes a string to a buffer. The buffer will be prefixed with the length of the string.
 * @param {string} str
 * @returns {Buffer}
 */
export function serializeString(str: string): Buffer {
    const buf = Buffer.alloc(str.length + 2);

    buf.writeUInt16BE(str.length);
    buf.write(str, 2);

    return buf;
}
