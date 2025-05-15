import { describe, it, expect, beforeEach } from 'vitest';
import {
    PersonaMapsMessage,
    PersonaList,
    PersonaRecord,
    serializeString,
} from './PersonaMapsMessage';
import { BytableHeader } from '@rustymotors/binary';

describe('PersonaMapsMessage', () => {
    let message: PersonaMapsMessage;

    beforeEach(() => {
        message = new PersonaMapsMessage();
        // @ts-ignore: _header is protected
        message._header = new BytableHeader();
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
    });
});
