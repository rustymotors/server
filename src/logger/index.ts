import P from "pino";
import * as dotenv from "dotenv-safe";
dotenv.config();

const logger = P({
  level: process.env["LOG_LEVEL"] || "info",
  name: "mcos",
});

export { logger };
