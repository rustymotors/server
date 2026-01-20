import { type ConnectionPool, type ConnectionPoolConfig, sql,   } from '@databases/pg';
import * as pg from "@databases/pg"

type createConnectionPool = (connectionConfig?: string | ConnectionPoolConfig | undefined) => ConnectionPool;

export {sql};

// Lazy initialization - only connect when needed
let _db: ConnectionPool | null = null;

function ensureDb(): ConnectionPool {
    if (!_db) {
        // Only create connection pool if DATABASE_URL is set
        // This prevents connection attempts in test environments
        if (!process.env['DATABASE_URL']) {
            throw new Error('DATABASE_URL environment variable is required');
        }
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
