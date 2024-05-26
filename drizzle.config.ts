import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DB_URL) {
  throw new Error("DB_URL must be set in the environment");
}

export default defineConfig({
  schema: "./src/schema/*.schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL,
  },
  schemaFilter: 'mcos'
});
