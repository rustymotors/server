// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { IRawPacket } from "../services/shared/interfaces/IRawPacket";
import { IServerConfiguration } from "../services/shared/interfaces/IServerConfiguration";
import { ILoggerInstance, ILoggers } from "../services/shared/logger";

import { NPSUserStatus } from "../services/shared/messageTypes/npsUserStatus";

import { Connection } from "../Connection";
import { pool } from "../services/shared/database";
import { premadeLogin } from "../packet";

async function _updateSessionKey(
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
        throw e;
      })
    );
}

export class LoginServer {
  public loggers: ILoggers;

  constructor(loggers: ILoggers) {
    this.loggers = loggers;
  }

  public async dataHandler(
    rawPacket: IRawPacket,
    config: IServerConfiguration
  ) {
    const { connection, data } = rawPacket;
    const { localPort, remoteAddress } = rawPacket;
    this.loggers.both.info(`=============================================
    Received packet on port ${localPort} from ${remoteAddress}...`);
    this.loggers.both.info("=============================================");
    // TODO: Check if this can be handled by a MessageNode object
    const { sock } = connection;
    const requestCode = data.readUInt16BE(0).toString(16);

    switch (requestCode) {
      // npsUserLogin
      case "501": {
        const responsePacket = await this._userLogin(connection, data, config);

        this.loggers.both.debug(
          `responsePacket's data prior to sending: ${responsePacket.toString(
            "hex"
          )}`
        );
        sock.write(responsePacket);
        break;
      }
      default:
        throw new Error(
          `LOGIN: Unknown code ${requestCode} was received on port 8226`
        );
    }
    return connection;
  }

  public _npsGetCustomerIdByContextId(contextId: string) {
    this.loggers.both.debug(`Entering _npsGetCustomerIdByContextId...`);
    const users = [
      {
        contextId: "5213dee3a6bcdb133373b2d4f3b9962758",
        customerId: Buffer.from([0xac, 0x01, 0x00, 0x00]),
        userId: Buffer.from([0x00, 0x00, 0x00, 0x02]),
      },
      {
        contextId: "d316cd2dd6bf870893dfbaaf17f965884e",
        customerId: Buffer.from([0x00, 0x54, 0xb4, 0x6c]),
        userId: Buffer.from([0x00, 0x00, 0x00, 0x01]),
      },
    ];
    if (contextId.toString() === "") {
      throw new Error(`Unknown contextId: ${contextId.toString()}`);
    }
    const userRecord = users.filter(user => {
      return user.contextId === contextId;
    });
    if (userRecord.length != 1) {
      this.loggers.both.debug({
        msg:
          "preparing to leave _npsGetCustomerIdByContextId after not finding record",
        contextId,
      });
      throw new Error(
        `Unable to locate user record matching contextId ${contextId}`
      );
    }
    this.loggers.both.debug({
      msg:
        "preparing to leave _npsGetCustomerIdByContextId after finding record",
      contextId,
      userRecord,
    });
    return userRecord[0];
  }

  /**
   * Process a UserLogin packet
   * Return a NPS_Serialize
   * @param {Connection} connection
   * @param {Buffer} data
   */
  public async _userLogin(
    connection: Connection,
    data: Buffer,
    config: IServerConfiguration
  ) {
    const { sock } = connection;
    const { localPort, remoteAddress } = sock;
    const userStatus = new NPSUserStatus(config, data, this.loggers.both);

    this.loggers.both.info("*** _userLogin ***");
    // logger.debug("Packet as hex: ", data.toString("hex"));

    this.loggers.both.info(`=============================================
    Received login packet on port ${localPort} from ${connection.remoteAddress}...`);
    this.loggers.both.debug(
      `NPS opCode:           ${userStatus.opCode.toString()}`
    );
    this.loggers.both.debug(`contextId:            ${userStatus.contextId}`);
    this.loggers.both.debug(`Decrypted SessionKey: ${userStatus.sessionKey}`);
    this.loggers.both.info("=============================================");

    // Load the customer record by contextId
    // TODO: This needs to be from a database, right now is it static
    const customer = this._npsGetCustomerIdByContextId(userStatus.contextId);

    // Save sessionKey in database under customerId
    this.loggers.both.debug(`Preparing to update session key in db`);
    await _updateSessionKey(
      customer.customerId.readInt32BE(0),
      userStatus.sessionKey,
      userStatus.contextId,
      connection.id
    );
    this.loggers.both.debug(`Session key updated`);

    // Create the packet content
    // TODO: This needs to be dynamically generated, right now we are using a
    // a static packet that works _most_ of the time
    const packetContent = premadeLogin();
    this.loggers.both.warn(
      `Using Premade Login: ${packetContent.toString("hex")}`
    );

    // MsgId: 0x601
    Buffer.from([0x06, 0x01]).copy(packetContent);

    // Packet length: 0x0100 = 256
    Buffer.from([0x01, 0x00]).copy(packetContent, 2);

    // load the customer id
    customer.customerId.copy(packetContent, 12);

    // Don't use queue (+208, but I'm not sure if this includes the header or not)
    Buffer.from([0x00]).copy(packetContent, 208);

    /**
     * Return the packet twice for debug
     * Debug sends the login request twice, so we need to reply twice
     * Then send ok to login packet
     */
    const fullPacket = Buffer.concat([packetContent, packetContent]);
    // logger.debug("Full response packet length: ", fullPacket.length);
    // logger.debug("Full response packet as string: ", fullPacket.toString("hex"));
    return fullPacket;
  }
}
