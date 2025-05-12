import { BytableBase } from './BytableBase.js';
import { BytableObject } from './types.js';

export class BytableByte extends BytableBase implements BytableObject {
    protected value_: number = 0;
    protected name_: string = '';

    override deserialize(buffer: Buffer) {
        if (buffer.length < 1) {
            throw new Error(
                'Cannot deserialize buffer with insufficient length',
            );
        }
        this.value_ = buffer.readUInt8(0);
        return this;
    }

    override get serializeSize() {
        return 1;
    }

    override serialize() {
        const buffer = Buffer.alloc(1);
        buffer.writeUInt8(this.value_, 0);
        return buffer;
    }

    get json() {
        return {
            name: this.name_,
            serializeSize: this.serializeSize,
            value: this.value_,
        };
    }

    setName(name: string) {
        this.name_ = name;
    }

    override toString() {
        return JSON.stringify(this.json);
    }

    get name() {
        return this.name_;
    }

    get value() {
        return this.value_;
    }

    setValue(value: string | number | Buffer) {
        if (typeof value === 'number') {
            this.value_ = value;
        } else {
            throw new Error('Invalid value type');
        }
    }
}
