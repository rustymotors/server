import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";
dotenv.config();

if (!process.env.DB_URL) {
  throw new Error("DB_URL must be set in the environment");
}

export default {
  schema: "./libs/schema/*",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DB_URL,
  },
} satisfies Config;
