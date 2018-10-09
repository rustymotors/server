// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { IRawPacket } from "../IRawPacket";
import { IServerConfiguration } from "../IServerConfiguration";
import { ILoggerInstance } from "../logger";

import { NPSUserStatus } from "../messageTypes/npsUserStatus";

import { Connection } from "../Connection";
import { pool } from "../database";
import { premadeLogin } from "../packet";

async function _updateSessionKey(
  customerId: number,
  sessionKey: string,
  contextId: string,
  connectionId: string
) {
  const sKey = sessionKey.substr(0, 16);
  return pool
    .query(
      `INSERT INTO sessions (customer_id, session_key, s_key, context_id, 
    connection_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (customer_id) DO UPDATE SET session_key = $2, s_key = $3, context_id = $4, connection_id = $5`,
      [customerId, sessionKey, sKey, contextId, connectionId]
    )

    .catch(e => {
      throw e;
    });
}

export class LoginServer {
  public logger: ILoggerInstance;

  constructor(logger: ILoggerInstance) {
    this.logger = logger;
  }

  public async dataHandler(
    rawPacket: IRawPacket,
    config: IServerConfiguration
  ) {
    const { connection, data } = rawPacket;
    const { localPort, remoteAddress } = rawPacket;
    this.logger.info(`=============================================
    Received packet on port ${localPort} from ${remoteAddress}...`);
    this.logger.info("=============================================");
    // TODO: Check if this can be handled by a MessageNode object
    const { sock } = connection;
    const requestCode = data.readUInt16BE(0).toString(16);

    switch (requestCode) {
      // npsUserLogin
      case "501": {
        const responsePacket = await this._userLogin(connection, data, config);

        this.logger.debug(
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
    const userStatus = new NPSUserStatus(config, data, this.logger);

    this.logger.info("*** _userLogin ****");
    // logger.debug("Packet as hex: ", data.toString("hex"));

    this.logger.info(`=============================================
    Received login packet on port ${localPort} from ${
      connection.remoteAddress
    }...`);
    this.logger.debug(`NPS opCode:           ${userStatus.opCode.toString()}`);
    this.logger.debug(`contextId:            ${userStatus.contextId}`);
    this.logger.debug(`Decrypted SessionKey: ${userStatus.sessionKey}`);
    this.logger.info("=============================================");

    // Load the customer record by contextId
    // TODO: This needs to be from a database, right now is it static
    const customer = this._npsGetCustomerIdByContextId(userStatus.contextId);

    // Save sessionKey in database under customerId
    await _updateSessionKey(
      customer.customerId.readInt32BE(0),
      userStatus.sessionKey,
      userStatus.contextId,
      connection.id
    );

    // Create the packet content
    // TODO: This needs to be dynamically generated, right now we are using a
    // a static packet that works _most_ of the time
    const packetContent = premadeLogin();
    this.logger.warn(`Using Premade Login: ${packetContent.toString("hex")}`);

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
