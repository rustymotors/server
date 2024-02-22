import { createPool } from "slonik";

export const slonik = await createPool(
    "postgres://user:password@localhost:5432/rm",
);
export { sql, createSqlTag } from "slonik";
export { z } from "zod";
