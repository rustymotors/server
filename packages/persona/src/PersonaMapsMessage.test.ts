import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    PersonaMapsMessage,
    PersonaList,
    PersonaRecord,
    serializeString,
} from './PersonaMapsMessage.js';
import { BytableHeader } from '@rustymotors/binary';

describe('PersonaMapsMessage', () => {
    let message: PersonaMapsMessage;

    beforeEach(() => {
        message = new PersonaMapsMessage();
        // @ts-ignore: _header is protected
        message._header = new BytableHeader();
    });

    const defaultPersonaRecordSize = PersonaRecord.size;
    beforeEach(() => {
        // Always restore the original size method before each test
        // @ts-ignore
        PersonaRecord.size = defaultPersonaRecordSize;
    });
    afterEach(() => {
        // Always restore the original size method after each test
        // @ts-ignore
        PersonaRecord.size = defaultPersonaRecordSize;
    });

    it('should instantiate with undefined personaRecords', () => {
        expect(message._personaRecords).toBeUndefined();
    });

    it('should throw when serializing without personaRecords', () => {
        expect(() => message.serialize()).toThrow(
            'PersonaRecords is undefined',
        );
    });

    it('should serialize and deserialize correctly with personaRecords', () => {
        // Prepare PersonaList with one PersonaRecord
        const personaList = new PersonaList();
        const personaRecord = new PersonaRecord();
        personaRecord.customerId = 123;
        personaRecord.personaId = 456;
        personaRecord.personaName = 'TestPersona';
        personaRecord.shardId = 789;
        personaList.addPersonaRecord(personaRecord);

        message._personaRecords = personaList;

        // Set up header
        // @ts-ignore: _header is protected
        message._header.length =
            message.header.serializeSize + 2 + personaList.size();

        const buffer = message.serialize();

        // Should have correct length
        expect(buffer.length).toBe(
            message.header.serializeSize + 2 + personaList.size(),
        );

        // Should write persona count at offset 12
        expect(buffer.readUInt16BE(12)).toBe(1);

        // Now test deserialization
        const newMessage = new PersonaMapsMessage();
        // @ts-ignore: _header is protected
        newMessage._header = new BytableHeader();
        newMessage.deserialize(buffer);

        expect(newMessage.raw).toEqual(buffer);
        // The body should be set, but _personaRecords is not set by deserialize
        // (since setBody is not implemented), so we only check raw and header
        expect(newMessage.header).toBeDefined();
    });

    it('should return correct JSON representation', () => {
        const personaList = new PersonaList();
        const personaRecord = new PersonaRecord();
        personaRecord.customerId = 1;
        personaRecord.personaId = 2;
        personaRecord.personaName = 'Test';
        personaRecord.shardId = 3;
        personaList.addPersonaRecord(personaRecord);

        message._personaRecords = personaList;

        const json = message.asJSON();
        expect(json).toHaveProperty('header');
        expect(json).toHaveProperty('personaRecords');
        expect(json.personaRecords).toBe(personaList);
    });

    it('should return correct string representation', () => {
        const personaList = new PersonaList();
        message._personaRecords = personaList;
        const str = message.toString();
        expect(str).toContain('PersonaMapsMessage');
        expect(str).toContain('personaRecords');
    });

    describe('serializeString', () => {
        it('should serialize string with length prefix', () => {
            const str = 'hello';
            const buf = serializeString(str);
            expect(buf.readUInt16BE(0)).toBe(str.length);
            expect(buf.toString('utf8', 2)).toBe(str);
        });

        it('should correctly deserialize a buffer into a PersonaRecord', () => {
            // Prepare a buffer with known values for all fields
            const personaName = 'JohnDoe';
            const gameSerialNumber = 'SERIAL123';
            const hashedKey = 'HASHEDKEY'.padEnd(400, '\0');
            const extraData = Buffer.alloc(512, 0x11);
            const personaData = Buffer.alloc(256, 0x22);
            const pictureData = Buffer.from([0x33]);

            let offset = 0;
            const buf = Buffer.alloc(
                4 +
                    33 +
                    4 +
                    4 +
                    4 +
                    4 +
                    4 +
                    2 +
                    4 +
                    33 +
                    4 +
                    4 +
                    512 +
                    256 +
                    1 +
                    2 +
                    4 +
                    400 +
                    2 +
                    4,
            );

            buf.writeUInt32BE(42, offset); // customerId
            offset += 4;
            buf.write(personaName.padEnd(33, '\0'), offset, 'utf8'); // personaName
            offset += 33;
            buf.writeUInt32BE(1001, offset); // serverDataId
            offset += 4;
            buf.writeUInt32BE(2002, offset); // createDate
            offset += 4;
            buf.writeUInt32BE(3003, offset); // lastLogin
            offset += 4;
            buf.writeUInt32BE(4004, offset); // numberOfGames
            offset += 4;
            buf.writeUInt32BE(5005, offset); // personaId
            offset += 4;
            buf.writeUInt16BE(1, offset); // isOnline
            offset += 2;
            buf.writeUInt32BE(6006, offset); // purchaseTimestamp
            offset += 4;
            buf.write(gameSerialNumber.padEnd(33, '\0'), offset, 'utf8'); // gameSerialNumber
            offset += 33;
            buf.writeUInt32BE(7007, offset); // timeOnline
            offset += 4;
            buf.writeUInt32BE(8008, offset); // timeInGame
            offset += 4;
            extraData.copy(buf, offset); // extraData
            offset += 512;
            personaData.copy(buf, offset); // personaData
            offset += 256;
            pictureData.copy(buf, offset); // pictureData
            offset += 1;
            buf.writeUInt16BE(2, offset); // dnd
            offset += 2;
            buf.writeUInt32BE(9009, offset); // startedPlayingTimestamp
            offset += 4;
            buf.write(hashedKey, offset, 400, 'utf8'); // hashedKey
            offset += 400;
            buf.writeUInt16BE(3, offset); // personaLevel
            offset += 2;
            buf.writeUInt32BE(123456, offset); // shardId

            const record = new PersonaRecord().deserialize(buf);

            expect(record.customerId).toBe(42);
            expect(record.personaName.replace(/\0+$/, '')).toBe(personaName);
            expect(record.serverDataId).toBe(1001);
            expect(record.createDate).toBe(2002);
            expect(record.lastLogin).toBe(3003);
            expect(record.numberOfGames).toBe(4004);
            expect(record.personaId).toBe(5005);
            expect(record.isOnline).toBe(1);
            expect(record.purchaseTimestamp).toBe(6006);
            expect(record.gameSerialNumber.replace(/\0+$/, '')).toBe(
                gameSerialNumber,
            );
            expect(record.timeOnline).toBe(7007);
            expect(record.timeInGame).toBe(8008);
            expect(record.extraData.equals(extraData)).toBe(true);
            expect(record.personaData.equals(personaData)).toBe(true);
            expect(record.pictureData.equals(pictureData)).toBe(true);
            expect(record.dnd).toBe(2);
            expect(record.startedPlayingTimestamp).toBe(9009);
            expect(record.hashedKey.replace(/\0+$/, '')).toBe('HASHEDKEY');
            expect(record.personaLevel).toBe(3);
            expect(record.shardId).toBe(123456);
        });

        it('should handle empty buffer gracefully (throws)', () => {
            const record = new PersonaRecord();
            expect(() => record.deserialize(Buffer.alloc(0))).toThrow();
        });

        it('should serialize PersonaRecord to correct buffer format', () => {
            // @ts-ignore
            PersonaRecord.size = () => 52;
            const personaRecord = new PersonaRecord();
            personaRecord.customerId = 1234;
            personaRecord.personaId = 5678;
            personaRecord.personaName = 'TestName';
            personaRecord.shardId = 4321;

            const buf = personaRecord.serialize();
            console.log(
                'serialize correct format: buf.length =',
                buf.length,
                buf,
            );

            // Should be correct size
            expect(buf.length).toBe(PersonaRecord.size());

            let offset = 0;
            expect(buf.readUInt32BE(offset)).toBe(1234); // customerId
            offset += 4;
            expect(buf.readUInt16BE(offset)).toBe(3341); // hardcoded value
            offset += 2;
            expect(buf.readUInt32BE(offset)).toBe(5678); // personaId
            offset += 4;
            expect(buf.readUInt32BE(offset)).toBe(4321); // shardId
            offset += 4;
            offset += 4; // unknown 4 bytes

            // personaName as length-prefixed string (2 bytes length + string)
            const nameLen = buf.readUInt16BE(offset);
            expect(nameLen).toBe('TestName'.length);
            expect(buf.toString('utf8', offset + 2, offset + 2 + nameLen)).toBe(
                'TestName',
            );
        });

        it('should handle empty personaName in serialization', () => {
            // @ts-ignore
            PersonaRecord.size = () => 52;
            const personaRecord = new PersonaRecord();
            personaRecord.customerId = 1;
            personaRecord.personaId = 2;
            personaRecord.personaName = '';
            personaRecord.shardId = 3;

            const buf = personaRecord.serialize();
            console.log('serialize empty name: buf.length =', buf.length, buf);

            // personaName length should be 0
            expect(buf.readUInt16BE(18)).toBe(0);
        });

        it('should throw and wrap error if serialization fails', () => {
            const personaRecord = new PersonaRecord();
            const origSize = PersonaRecord.size;
            // @ts-ignore
            PersonaRecord.size = () => {
                throw new Error('fail');
            };
            try {
                expect(() => personaRecord.serialize()).toThrow(
                    /Error serializing PersonaRecord buffer/,
                );
            } finally {
                // @ts-ignore
                PersonaRecord.size = origSize;
            }
        });
    });
});
