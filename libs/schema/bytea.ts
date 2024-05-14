import { customType } from 'drizzle-orm/pg-core';


export const bytea = customType<{ data: Buffer; driverData: string; }>({
    dataType() {
        return 'bytea';
    },
    toDriver(value: Buffer): string {
        return `\\x${value.toString('hex')}`;
    },
    fromDriver(value: string): Buffer {
        return Buffer.from(value.slice(2), 'hex');
    },
});
