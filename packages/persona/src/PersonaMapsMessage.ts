import { BytableMessage } from '@rustymotors/binary';

/**
 *
 * This is type UserGameData
 */
export class PersonaRecord {
    customerId: number;
    personaName: string;
    serverDataId: number;
    createDate: number;
    lastLogin: number;
    numberOfGames: number;
    personaId: number;
    isOnline: number;
    purchaseTimestamp: number;
    gameSerialNumber: string;
    timeOnline: number;
    timeInGame: number;
    extraData: Buffer;
    personaData: Buffer;
    pictureData: Buffer;
    dnd: number;
    startedPlayingTimestamp: number;
    hashedKey: string;
    personaLevel: number;
    shardId: number;
    constructor() {
        this.customerId = 0;
        this.personaName = '';
        this.serverDataId = 0;
        this.createDate = 0;
        this.lastLogin = 0;
        this.numberOfGames = 0;
        this.personaId = 0;
        this.isOnline = 0;
        this.purchaseTimestamp = 0;
        this.gameSerialNumber = '';
        this.timeOnline = 0;
        this.timeInGame = 0;
        this.extraData = Buffer.alloc(512);
        this.personaData = Buffer.alloc(256);
        this.pictureData = Buffer.alloc(1);
        this.dnd = 0;
        this.startedPlayingTimestamp = 0;
        this.hashedKey = '';
        this.personaLevel = 0;
        this.shardId = 0;
    }

    /**
     *
     * @param {Buffer} buffer
     * @returns {PersonaRecord}
     */
    deserialize(buffer: Buffer): PersonaRecord {
        let offset = 0;
        this.customerId = buffer.readUInt32BE(offset); // 4
        offset += 4;
        this.personaName = buffer.toString('utf8', offset, offset + 33); // 33
        offset += 33;
        this.serverDataId = buffer.readUInt32BE(offset); // 4
        offset += 4;
        this.createDate = buffer.readUInt32BE(offset); // 4
        offset += 4;
        this.lastLogin = buffer.readUInt32BE(offset); // 4
        offset += 4;
        this.numberOfGames = buffer.readUInt32BE(offset); // 4
        offset += 4;
        this.personaId = buffer.readUInt32BE(offset); // 4
        offset += 4;
        this.isOnline = buffer.readUInt16BE(offset); // 2
        offset += 2;
        this.purchaseTimestamp = buffer.readUInt32BE(offset); // 4
        offset += 4;
        this.gameSerialNumber = buffer
            .subarray(offset, offset + 33)
            .toString('utf8'); // 33
        offset += 33;
        this.timeOnline = buffer.readUInt32BE(offset); // 4
        offset += 4;
        this.timeInGame = buffer.readUInt32BE(offset); // 4
        offset += 4;
        this.extraData = buffer.subarray(offset, offset + 512); // 512
        offset += 512;
        this.personaData = buffer.subarray(offset, offset + 256); // 256
        offset += 256;
        this.pictureData = buffer.subarray(offset, offset + 1); // 1
        offset += 1;
        this.dnd = buffer.readUInt16BE(offset); // 2
        offset += 2;
        this.startedPlayingTimestamp = buffer.readUInt32BE(offset); // 4
        offset += 4;
        this.hashedKey = buffer.subarray(offset, offset + 400).toString('utf8'); // 400
        offset += 400;
        this.personaLevel = buffer.readUInt16BE(offset); // 2
        offset += 2;
        this.shardId = buffer.readUInt32BE(offset); // 2
        // Offset 1285
        return this;
    }

    /**
     *
     * @returns {Buffer}
     */
    serialize(): Buffer {
        try {
            const size = PersonaRecord.size();
            const buffer = Buffer.alloc(size);
            if (size === 0) return buffer;
            let offset = 0;
            buffer.writeUInt32BE(this.customerId, offset); // 4 - Unknown if this is correct
            offset += 4; // offset = 4
            buffer.writeUInt16BE(3341, offset); // 2 - unknown if this is correct
            offset += 2; // offset = 6
            buffer.writeUInt32BE(this.personaId, offset); // 4 - Known to be correct
            offset += 4; // offset = 10
            buffer.writeUInt32BE(this.shardId, offset); // 4 - Known to be correct
            offset += 4; // offset = 14
            // We don't know what goes here yet
            offset += 4; // offset = 18
            // Write personaName as 2-byte length + up to 32 bytes UTF-8, padded with zeros
            const nameBuf = Buffer.alloc(34, 0); // 2 bytes length + 32 bytes name
            const nameLen = Buffer.byteLength(this.personaName, 'utf8');
            nameBuf.writeUInt16BE(nameLen, 0);
            if (nameLen > 0) {
                nameBuf.write(this.personaName, 2, 32, 'utf8');
            }
            nameBuf.copy(buffer, offset);
            // offset = 52
            return buffer;
        } catch (error) {
            if (error instanceof Error) {
                const err = new Error(
                    `Error serializing PersonaRecord buffer: ${error.message}`,
                );
                err.cause = error;
                throw err;
            } else {
                const err = new Error(
                    `Error serializing PersonaRecord buffer: ${String(error)}`,
                );
                err.cause = error;
                throw err;
            }
        }
    }

    static size() {
        return 52;
    }

    toJSON() {
        return {
            customerId: this.customerId,
            personaId: this.personaId,
            personaName: this.personaName,
            shardId: this.shardId,
            serverDataId: this.serverDataId,
            // createDate: this.createDate,
            // lastLogin: this.lastLogin,
            // numberOfGames: this.numberOfGames,
            // isOnline: this.isOnline,
            // purchaseTimestamp: this.purchaseTimestamp,
            // gameSerialNumber: this.gameSerialNumber,
            // timeOnline: this.timeOnline,
            // timeInGame: this.timeInGame,
            // extraData: this.extraData,
            // personaData: this.personaData,
            // pictureData: this.pictureData,
            // dnd: this.dnd,
            // startedPlayingTimestamp: this.startedPlayingTimestamp,
            // hashedKey: this.hashedKey,
            // personaLevel: this.personaLevel,
        };
    }

    asJSON() {
        return this.toJSON();
    }

    toString() {
        return `PersonaRecord: ${JSON.stringify(this.toJSON())}`;
    }
}

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
                throw Error('PersonaRecords is undefined');
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
export class PersonaMapsMessage extends BytableMessage {
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
    override deserialize(buffer: Buffer): this {
        try {
            this.header.deserialize(buffer);
            this.setBody(buffer.subarray(this.header.serializeSize));
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
    override serialize(): Buffer {
        try {
            if (!this._personaRecords) {
                throw Error('PersonaRecords is undefined');
            }
            this.header.setMessageLength(
                this.header.serializeSize + 2 + this._personaRecords.size(),
            );
            const buffer = Buffer.alloc(this.header.messageLength);
            this.header.serialize().copy(buffer);

            // Write the persona count. This is known to be correct at offset 12
            buffer.writeUInt16BE(this._personaRecords.personaCount(), 12);
            // This is a serialized PersonaList
            this.data.copy(buffer, this.header.serializeSize + 2);
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
            header: this.header,
            personaRecords: this._personaRecords,
        };
    }

    override toString() {
        return `PersonaMapsMessage: ${JSON.stringify({
            header: this.header,
            personaRecords: this._personaRecords,
        })}`;
    }
}

/**
 * Serializes a string into a buffer with a 2-byte big-endian length prefix.
 *
 * @param str - The string to serialize.
 * @returns A buffer containing the length-prefixed UTF-8 encoded string.
 */
export function serializeString(str: string): Buffer {
    const buf = Buffer.alloc(str.length + 2);

    buf.writeUInt16BE(str.length);
    buf.write(str, 2);

    return buf;
}
