import { Logger } from "./loggerManager";
const pool = require("./db/index");

export class DatabaseManager {
  public logger = new Logger().getLogger("DatabaseManager");

  public async fetchSessionKeyByCustomerId(customerId: number) {
    try {
      const { rows } = await pool.query(
        "SELECT session_key, s_key FROM sessions WHERE customer_id = $1",
        [customerId]
      );
      return rows[0];
    } catch (e) {
      this.logger.warn(`Unable to update session key ${e}`);
    }
  }

  /**
   * Fetch session key from database based on remote address
   * @param {string} remoteAddress
   */
  public async fetchSessionKeyByConnectionId(connectionId: string) {
    //==
    try {
      const { rows } = await pool.query(
        "SELECT session_key, s_key FROM sessions WHERE connection_id = $1",
        [connectionId]
      );
      return rows[0];
    } catch (e) {
      this.logger.warn(`Unable to update session key ${e}`);
    }
  }

  public async _updateSessionKey(
    customerId: number,
    sessionKey: string,
    contextId: string,
    connectionId: string
  ) {
    const sKey = sessionKey.substr(0, 16);
    try {
      const { rows } = await pool.query(
        "INSERT INTO sessions (customer_id, session_key, s_key, context_id, connection_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (customer_id) DO UPDATE SET session_key = $2, s_key = $3, context_id = $4, connection_id = $5",
        [customerId, sessionKey, sKey, contextId, connectionId]
      );
      return rows;
    } catch (e) {
      this.logger.fatal(`Unable to update session key: ${e}`);
      process.exit(-1);
    }
  }
}
