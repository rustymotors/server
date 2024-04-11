import { type DatabasePool, createSqlTag } from "slonik";
export declare function getSlonik(): Promise<{
    slonik: DatabasePool;
    sql: ReturnType<typeof createSqlTag>;
}>;
