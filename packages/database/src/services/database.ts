import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;

let database: NodePgDatabase;
export function getDatabase(): NodePgDatabase {
    if (!database) {
        const pool = new Pool({
            connectionString: "postgres://user:password@localhost:5432/rm",
        });
        database = drizzle(pool);
    }
    return database;
}
