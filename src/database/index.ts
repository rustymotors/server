// @ts-check
// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Prisma, PrismaClient, Session } from "@prisma/client";
import type { SessionRecord } from "../types/index";
import { logger } from "../logger/index";
import { APP_CONFIG } from "../config/appconfig";

const log = logger.child({ service: "mcoserver:DatabaseMgr" });

/**
 * This class abstracts database methods
 * @class
 */
export class DatabaseManager {
  private static _instance: DatabaseManager;
  private connectionURI: string;
  changes = 0;
  localDB: PrismaClient | undefined;

  /**
   * Return the instance of the DatabaseManager class
   * @returns {DatabaseManager}
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager._instance) {
      DatabaseManager._instance = new DatabaseManager();
    }
    const self = DatabaseManager._instance;
    return self;
  }

  /**
   * Initialize database and set up schemas if needed
   * @returns {Promise<void}
   */
  async init(): Promise<void> {
    if (typeof this.localDB === "undefined") {
      log.debug(`Initializing the database...`);

      try {
        const self = DatabaseManager._instance;

        const db = new PrismaClient();

        // log.debug(`Database initialized`);
      } catch (err: unknown) {
        if (err instanceof Error) {
          const newError = new Error(
            `There was an error setting up the database: ${err.message}`
          );
          log.error(newError.message);
          throw newError;
        }
        throw err;
      }
    }
  }

  private constructor() {
    if (!APP_CONFIG.MCOS.SETTINGS.DATABASE_CONNECTION_URI) {
      throw new Error("Please set MCOS__SETTINGS__DATABASE_CONNECTION_URI");
    }
    this.connectionURI = APP_CONFIG.MCOS.SETTINGS.DATABASE_CONNECTION_URI;
  }

  /**
   * Locate customer session encryption key in the database
   * @param {number} customerId
   * @returns {SessionRecord}
   */
  async fetchSessionKeyByCustomerId(customerId: number): Promise<Session> {
    if (!this.localDB) {
      log.warn("Database not ready in fetchSessionKeyByCustomerId()");
      throw new Error("Error accessing database. Are you using the instance?");
    }

    const result = await this.localDB.session.findFirst({
      where: { customer_id: customerId },
    });

    if (result === null) {
      log.debug("Unable to locate session key");
      throw new Error("Unable to fetch session key");
    }
    return result;
  }

  /**
   * Locate customer session encryption key in the database
   * @param {number} customerId
   * @returns {SessionRecord}
   */
  async fetchSessionKeyByConnectionId(connectionId: string): Promise<Session> {
    if (!this.localDB) {
      log.warn("Database not ready in fetchSessionKeyByConnectionId()");
      throw new Error("Error accessing database. Are you using the instance?");
    }

    const result = await this.localDB.session.findFirst({
      where: { connection_id: connectionId },
    });

    if (result === null) {
      throw new Error("Unable to fetch session key");
    }
    return result;
  }

  /**
   * Create or overwrite a customer's session key record
   * @param {number} customerId
   * @param {string} sessionkey
   * @param {string} contextId
   * @param {string} connectionId
   * @returns {Promise<number}
   */
  async updateSessionKey(
    customerId: number,
    sessionkey: string,
    contextId: string,
    connectionId: string
  ): Promise<void> {
    const skey = sessionkey.slice(0, 16);

    if (!this.localDB) {
      log.warn("Database not ready in updateSessionKey()");
      throw new Error("Error accessing database. Are you using the instance?");
    }

    const result = await this.localDB.session.upsert({
      create: {
        customer_id: customerId,
        sessionkey: sessionkey,
        skey: skey,
        context_id: contextId,
        connection_id: connectionId,
      },
      update: {
        customer_id: customerId,
        sessionkey: sessionkey,
        skey: skey,
        context_id: contextId,
        connection_id: connectionId,
      },
      where: {
        connection_id: connectionId,
      },
    });

    if (result === null) {
      throw new Error("Unable to fetch session key");
    }

    return;
  }
}
