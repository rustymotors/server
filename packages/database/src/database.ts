import { ConnectionPool, ConnectionPoolConfig, sql,   } from '@databases/pg';
import * as pg from "@databases/pg"

type createConnectionPool = (connectionConfig?: string | ConnectionPoolConfig | undefined) => ConnectionPool;

export {sql};

export const db = (pg.default as unknown as createConnectionPool)(
    {
        bigIntMode: "bigint"
    }    
);
