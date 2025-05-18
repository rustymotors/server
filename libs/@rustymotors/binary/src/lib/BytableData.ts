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

import { BytableBase } from './BytableBase.js';
import { BytableFieldTypes } from './BytableMessage.js';
import { BytableObject } from './types.js';

export class BytableData extends BytableBase implements BytableObject {
    protected name_ = 'BytableData';
    protected fields_: Array<BytableObject> = [];
    protected serializeOrder_: Array<{
        name: string;
        field: keyof typeof BytableFieldTypes;
    }> = [];

    constructor() {
        super();
    }

    override deserialize(buffer: Buffer) {
        try {
            this.fields_ = []; // Clear fields before deserialization
            let offset = 0;
            for (const field of this.serializeOrder_) {
                if (!(field.field in BytableFieldTypes)) {
                    throw new Error(`Unknown field type: ${field.field}`);
                }

                const fieldType = BytableFieldTypes[field.field];
                const fieldInstance = new fieldType();
                fieldInstance.setName(field.name);
                fieldInstance.deserialize(buffer.subarray(offset));
                this.fields_.push(fieldInstance);
                offset += fieldInstance.serializeSize;
            }
        } catch (error) {
            const err = new Error(
                `Error deserializing message: ${(error as Error).message}`,
                {
                    cause: error,
                },
            );
            throw err;
        }
    }

    override get serializeSize() {
        const fieldSizes = this.fields_.map((field) => field.serializeSize);
        return fieldSizes.reduce((a, b) => a + b, 0);
    }

    override serialize() {
        const buffer = Buffer.alloc(this.serializeSize);
        let offset = 0;

        for (const field of this.fields_) {
            buffer.set(field.serialize(), offset);
            offset += field.serializeSize;
        }
        return buffer;
    }

    get json() {
        return {
            name: this.name,
            serializeSize: this.serializeSize,
            fields: this.fields_.map((field) => field.json),
        };
    }

    setName(name: string) {
        this.name_ = name;
    }

    override toString() {
        return JSON.stringify(this.json);
    }

    setSerializeOrder(
        serializeOrder: Array<{
            name: string;
            field: keyof typeof BytableFieldTypes;
        }>,
    ) {
        this.serializeOrder_ = serializeOrder;
        this.fields_ = serializeOrder.map(({ name, field }) => {
            if (!(field in BytableFieldTypes)) {
                throw new Error(`Unknown field type: ${field}`);
            }
            const fieldInstance = new BytableFieldTypes[field]();
            fieldInstance.setName(name);
            return fieldInstance;
        });
    }

    getFieldValueByName(name: string) {
        if (name === '') {
            return undefined;
        }
        const field = this.fields_.find((field) => field.name === name);
        if (!field) {
            throw new Error(`Field ${name} not found`);
        }
        return field.value;
    }

    setFieldValueByName(name: string, value: string | number | Buffer) {
        if (name === '') {
            return;
        }
        const field = this.fields_.find((field) => field.name === name);
        if (!field) {
            throw new Error(`Field ${name} not found`);
        }
        field.setValue(value);
    }

    get name() {
        return this.name_;
    }

    get value(): string | number {
        throw new Error('Not implemented');
    }

    setValue(_value: string | number | Buffer) {
        throw new Error('Not implemented');
    }
}
