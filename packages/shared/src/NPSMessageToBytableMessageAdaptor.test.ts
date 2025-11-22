import { describe, it, expect } from 'vitest';
import { NPSMessageToBytableMessageAdaptor } from './NPSMessageToBytableMessageAdaptor.js';
import { NPSMessage } from 'rusty-motors-shared';

describe('NPSMessageToBytableMessageAdaptor', () => {
    it('should initialize correctly', () => {
        const adaptor = new NPSMessageToBytableMessageAdaptor();
        expect(adaptor).toBeInstanceOf(NPSMessageToBytableMessageAdaptor);
    });

    it('should throw error for invalid version', () => {
        expect(() => new NPSMessageToBytableMessageAdaptor(2 as any)).toThrow();
    });

    it('should get and set body/data', () => {
        const adaptor = new NPSMessageToBytableMessageAdaptor();
        const data = Buffer.from([1, 2, 3]);
        
        adaptor.setBody(data);
        expect(adaptor.getBody()).toEqual(data);
        expect(adaptor.data).toEqual(data);

        const newData = Buffer.from([4, 5, 6]);
        adaptor.data = newData;
        expect(adaptor.getBody()).toEqual(newData);
    });

    it('should delegate serialize/deserialize to NPSMessage', () => {
        const adaptor = new NPSMessageToBytableMessageAdaptor();
        const data = Buffer.from([0x01, 0x02]);
        adaptor.setBody(data);

        // _doSerialize returns the serialized NPSMessage
        const serialized = adaptor._doSerialize();
        expect(Buffer.isBuffer(serialized)).toBe(true);

        const adaptor2 = new NPSMessageToBytableMessageAdaptor();
        adaptor2._doDeserialize(serialized);
        expect(adaptor2.getBody()).toEqual(data);
        
        // Public deserialize
        const adaptor3 = new NPSMessageToBytableMessageAdaptor();
        adaptor3.deserialize(serialized);
        expect(adaptor3.getBody()).toEqual(data);
    });

    it('should throw for unimplemented methods', () => {
        const adaptor = new NPSMessageToBytableMessageAdaptor();
        
        expect(() => adaptor.header).toThrow('Method not implemented.');
        expect(() => adaptor.serializeSize).toThrow('Method not implemented.');
        expect(() => adaptor.serialize()).toThrow('Method not implemented.');
        expect(() => adaptor.json).toThrow('Method not implemented.');
        expect(() => adaptor.setName('test')).toThrow('Method not implemented.');
        expect(() => adaptor.toString()).toThrow('Method not implemented.');
        expect(() => adaptor.setSerializeOrder([])).toThrow('Method not implemented.');
        expect(() => adaptor.getField('test')).toThrow('Method not implemented.');
        expect(() => adaptor.getFieldValueByName('test')).toThrow('Method not implemented.');
        expect(() => adaptor.htonl(1)).toThrow('Method not implemented.');
        expect(() => adaptor.coerceValue(1)).toThrow('Method not implemented.');
        expect(() => adaptor.setFieldValueByName('test', 1)).toThrow('Method not implemented.');
        expect(() => adaptor.setVersion(1)).toThrow('Method not implemented.');
        expect(() => adaptor.toHexString()).toThrow('Method not implemented.');
        expect(() => adaptor.name).toThrow('Method not implemented.');
        expect(() => adaptor.value).toThrow('Method not implemented.');
        expect(() => adaptor.setValue(1)).toThrow('Method not implemented.');
    });
});
