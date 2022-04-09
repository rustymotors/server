// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017-2021>  <Drazi Crendraven>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { logger } from "../logger/index.js";
import { DatabaseManager } from "../database/index.js";
import type { UnprocessedPacket, UserRecordMini } from "../types/index.js";
import { NPSUserStatus, premadeLogin } from "../message-types/index.js";
import type { TCPConnection } from "../core/tcpConnection.js";

const log = logger.child({ service: "mcoserver:LoginServer" });

/**
 * Manages the initial game connection setup and teardown.
 * @module LoginServer
 */

/**
 * @class
 * @property {DatabaseManager} databaseManager
 */
export class LoginServer {
  static _instance: LoginServer;
  databaseManager = DatabaseManager.getInstance();
/**
 * Get the single instance of the login server
 *
 * @static
 * @return {*}  {LoginServer}
 * @memberof LoginServer
 */
static getInstance(): LoginServer {
    if (!LoginServer._instance) {
      LoginServer._instance = new LoginServer();
    }
    return LoginServer._instance;
  }

  private constructor() {
    // Intentionally empty
  }

  /**
   *
   * @param {IRawPacket} rawPacket
   * @param {IServerConfig} config
   * @return {Promise<ConnectionObj>}
   */
  async dataHandler(rawPacket: UnprocessedPacket): Promise<TCPConnection> {
    let processed = true;
    const { connection, data } = rawPacket;
    const { localPort, remoteAddress } = rawPacket.connection;
    log.info(
      `Received Login Server packet: ${JSON.stringify({
        localPort,
        remoteAddress,
      })}`
    );
    // TODO: Check if this can be handled by a MessageNode object
    const { sock } = connection;
    const requestCode = data.readUInt16BE(0).toString(16);

    let responsePacket: Buffer | null = null;

    switch (requestCode) {
      // NpsUserLogin
      case "501": {
        responsePacket = await this._userLogin(connection, data);
        break;
      }

      default:
        log.debug(
          `Unknown nps code recieved',
          ${JSON.stringify({
            requestCode,
            localPort,
            data: rawPacket.data.toString("hex"),
          })}`
        );
        processed = false;
    }

    if (processed === true && responsePacket !== null) {
      log.debug(
        `responsePacket object from dataHandler',
      ${JSON.stringify({
        userStatus: responsePacket.toString("hex"),
      })}`
      );
      if (responsePacket instanceof Buffer) {
        log.debug(
          `responsePacket's data prior to sending: ${responsePacket.toString(
            "hex"
          )}`
        );          
      }
      sock.write(responsePacket);
    }

    return connection;
  }

  /**
   *
   * @param {string} contextId
   * @return {Promise<IUserRecordMini>}
   */
  public _npsGetCustomerIdByContextId(
    contextId: string
  ): UserRecordMini {
    log.debug(">>> _npsGetCustomerIdByContextId");
    const users: UserRecordMini[] = [
      {
        contextId: "5213dee3a6bcdb133373b2d4f3b9962758",
        customerId: 0xac_01_00_00,
        userId: 0x00_00_00_02,
      },
      {
        contextId: "d316cd2dd6bf870893dfbaaf17f965884e",
        customerId: 0x00_54_b4_6c,
        userId: 0x00_00_00_01,
      },
    ];
    if (contextId.toString() === "") {
      throw new Error(`Unknown contextId: ${contextId.toString()}`);
    }

    const userRecord = users.filter((user) => user.contextId === contextId);
    if (typeof userRecord[0] === "undefined" || userRecord.length !== 1) {
      log.debug(
        `preparing to leave _npsGetCustomerIdByContextId after not finding record',
        ${JSON.stringify({
          contextId,
        })}`
      );
      throw new Error(
        `Unable to locate user record matching contextId ${contextId}`
      );
    }

    log.debug(
      `preparing to leave _npsGetCustomerIdByContextId after finding record',
      ${JSON.stringify({
        contextId,
        userRecord,
      })}`
    );
    return userRecord[0];
  }

  /**
   * Process a UserLogin packet
   * Should return a @link {module:NPSMsg} object
   * @param {ConnectionObj} connection
   * @param {Buffer} data
   * @param {IServerConfig} config
   * @return {Promise<Buffer>}
   */
  private async _userLogin(
    connection: TCPConnection,
    data: Buffer
  ): Promise<Buffer> {
    const { sock } = connection;
    const { localPort } = sock;
    const userStatus = new NPSUserStatus(data);
    log.info(
      `Received login packet,
      ${JSON.stringify({
        localPort,
        remoteAddress: connection.remoteAddress,
      })}`
    );

    userStatus.extractSessionKeyFromPacket(data);

    log.debug(
      `UserStatus object from _userLogin,
      ${JSON.stringify({
        userStatus: userStatus.toJSON(),
      })}`
    );
    userStatus.dumpPacket();

    // Load the customer record by contextId
    // TODO: This needs to be from a database, right now is it static
    const customer = this._npsGetCustomerIdByContextId(
      userStatus.contextId
    );

    // Save sessionkey in database under customerId
    log.debug("Preparing to update session key in db");
    await this.databaseManager
      .updateSessionKey(
        customer.customerId,
        userStatus.sessionkey,
        userStatus.contextId,
        connection.id
      )
      .catch((error: unknown) => {
        if (error instanceof Error) {
          log.error(`Unable to update session key 3: ${error.message}`);
        }

        throw new Error("Error in userLogin");
      });

    log.info("Session key updated");

    // Create the packet content
    // TODO: This needs to be dynamically generated, right now we are using a
    // a static packet that works _most_ of the time
    // TODO: investigate if funk/hip hop is the only radio that works.
    const packetContent = premadeLogin();
    log.debug(`Using Premade Login: ${packetContent.toString("hex")}`);

    // MsgId: 0x601
    Buffer.from([0x06, 0x01]).copy(packetContent);

    // Packet length: 0x0100 = 256
    Buffer.from([0x01, 0x00]).copy(packetContent, 2);

    // Load the customer id
    packetContent.writeInt32BE(customer.customerId, 12);

    // Don't use queue (+208, but I'm not sure if this includes the header or not)
    Buffer.from([0x00]).copy(packetContent, 208);

    /**
     * Return the packet twice for debug
     * Debug sends the login request twice, so we need to reply twice
     * Then send ok to login packet
     */
    return Buffer.concat([packetContent, packetContent]);
  }
}
