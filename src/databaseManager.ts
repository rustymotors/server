import * as bunyan from "bunyan";
import { pool } from "./services/shared/database";

export class DatabaseManager {
  public pool: Promise<import("sqlite").Database>;
  public logger: bunyan;

  constructor() {
    this.pool = pool;
    this.logger = bunyan
      .createLogger({ name: "mcoServer" })
      .child({ module: "databaseManager" });
  }

  public async fetchSessionKeyByCustomerId(customerId: number) {
    this.logger.debug(customerId.toString());
    const db = await pool;
    return await db
      .get("SELECT session_key, s_key FROM sessions WHERE customer_id = ?", [
        customerId,
      ])
      .catch((e: any) => {
        throw new Error(
          `[Lobby] Unable to fetch session key for customerId: ${customerId}: ${e}`
        );
      });
  }

  /**
   * Fetch session key from database based on remote address
   * @param {string} remoteAddress
   */
  public async fetchSessionKeyByConnectionId(connectionId: string) {
    const db = await pool;

    return await db
      .get("SELECT session_key, s_key FROM sessions WHERE connection_id = ?", [
        connectionId,
      ])
      .catch((e: any) => {
        throw new Error(
          `[databaseManager] Unable to fetch session key for connection id: ${connectionId}: ${e}`
        );
      });
  }

  public async _updateSessionKey(
    customerId: number,
    sessionKey: string,
    contextId: string,
    connectionId: string
  ) {
    const sKey = sessionKey.substr(0, 16);
    const db = await pool;
    return await db
      .get(
        `INSERT INTO sessions (customer_id, session_key, s_key, context_id, 
	  connection_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (customer_id) DO UPDATE SET session_key = $2, s_key = $3, context_id = $4, connection_id = $5`,
        [customerId, sessionKey, sKey, contextId, connectionId]
      )

      .catch((e: any) =>
        setImmediate(() => {
          throw new Error(
            `[databaseManager] Unable to update session key for connection id: ${connectionId}: ${e}`
          );
        })
      );
  }
}
