import { ConnectionPool, ConnectionPoolConfig, sql,   } from '@databases/pg';
import * as pg from "@databases/pg"

type createConnectionPool = (connectionConfig?: string | ConnectionPoolConfig | undefined) => ConnectionPool;

export {sql};

// Lazy initialization - only connect when needed
let _db: ConnectionPool | null = null;

function ensureDb(): ConnectionPool {
    if (!_db) {
        _db = (pg.default as unknown as createConnectionPool)(
            {
                bigIntMode: "bigint"
            }
        );
    }
    return _db;
}

export const db = new Proxy({} as ConnectionPool, {
    get(_target, prop) {
        const dbInstance = ensureDb();
        const value = (dbInstance as any)[prop];
        return typeof value === 'function' ? value.bind(dbInstance) : value;
    }
});
