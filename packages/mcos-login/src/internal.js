// mcos is a game server, written from scratch, for an old game
// Copyright (C) <2017>  <Drazi Crendraven>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { DatabaseManager } from "../../mcos-database/src/index.js";
import { GSMessageBase } from "../../mcos-gateway/src/GMessageBase.js";
import { NPSUserStatus } from "./NPSUserStatus.js";
import { premadeLogin } from "./premadeLogin.js";
import createDebug from 'debug'
import { createLogger } from 'bunyan'
import { NPSMessage } from "../../mcos-gateway/src/NPSMessage.js";

const appName = 'mcos:login:internal'

const debug = createDebug(appName)
const log = createLogger({ name: appName })



/** @type {import("./index.js").UserRecordMini[]} */
const userRecords = [
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


/**
 * Process a UserLogin packet
 * @private
 * @param {import("../../mcos-gateway/src/sockets.js").BufferWithConnection} dataConnection
 * @return {Promise<import("../../mcos-gateway/src/sockets.js").GSMessageArrayWithConnection>}
 */
async function login(
    dataConnection
) {
    const { connectionId, data } = dataConnection;

    log.info(`Received login packet: ${connectionId}`);

    const newGameMessage = new GSMessageBase();
    newGameMessage.deserialize(data.subarray(0, 10));
    debug(`Raw game message: ${JSON.stringify(newGameMessage)}`);

    debug('Requesting NPSUserStatus packet')
    const userStatus = new NPSUserStatus(data);
    debug('NPSUserStatus packet creation success')

    debug('Requesting Key extraction')
    userStatus.extractSessionKeyFromPacket(data);
    debug('Key extraction success')

    const { contextId, sessionkey } = userStatus;

    debug(
        `UserStatus object from _userLogin,
      ${JSON.stringify({
          userStatus: userStatus.toJSON(),
      })}`
    );
    userStatus.dumpPacket();

    // Load the customer record by contextId
    // TODO: #1175 Move customer records from being hard-coded to database records
    const userRecord = userRecords.find((r) => {
        return r.contextId === contextId;
    });

    if (typeof userRecord === "undefined") {
        // We were not able to locate the user's record
        const errMessage = `Unable to locate a user record for the context id: ${contextId}`;
        log.error(errMessage);
        throw new Error("USER_NOT_FOUND");
    }

    // Save sessionkey in database under customerId
    debug("Preparing to update session key in db");
    await DatabaseManager.getInstance()
        .updateSessionKey(
            userRecord.customerId,
            sessionkey,
            contextId,
            connectionId
        )
        .catch((/** @type {unknown} */ error) => {
            log.error(`Unable to update session key 3: ${String(error)}`);
            throw new Error("Error in userLogin");
        });

    log.info("Session key updated");

    // Create the packet content
    // TODO: #1176 Return the login connection response packet as a MessagePacket object
    const packetContent = premadeLogin();
    debug(`Using Premade Login: ${packetContent.toString("hex")}`);

    // MsgId: 0x601
    Buffer.from([0x06, 0x01]).copy(packetContent);

    // Packet length: 0x0100 = 256
    Buffer.from([0x01, 0x00]).copy(packetContent, 2);

    // Load the customer id
    packetContent.writeInt32BE(userRecord.customerId, 12);

    // Don't use queue (+208, but I'm not sure if this includes the header or not)
    Buffer.from([0x00]).copy(packetContent, 208);

    const newPacket = new NPSMessage("sent");
    newPacket.deserialize(packetContent);

    /**
     * Return the packet twice for debug
     * Debug sends the login request twice, so we need to reply twice
     * Then send ok to login packet
     */

    // Update the data buffer
    /** @type {import("../../mcos-gateway/src/sockets.js").GSMessageArrayWithConnection} */
    const response = {
        connection: dataConnection.connection,
        messages: [newPacket, newPacket],
    };
    debug("Leaving login");
    return response;
}

export const messageHandlers = [
    {
        id: "501",
        handler: login,
    },
];

/**
 *
 *
 * @param {import("../../mcos-gateway/src/sockets.js").BufferWithConnection} dataConnection
 * @return {Promise<import("../../mcos-gateway/src/sockets.js").GSMessageArrayWithConnection>}
 */
export async function handleData(
    dataConnection
) {
    const { connectionId, data } = dataConnection;

    log.info(`Received Login Server packet: ${connectionId}`);

    // Check the request code
    const requestCode = data.readUInt16BE(0).toString(16);

    const supportedHandler = messageHandlers.find((h) => {
        return h.id === requestCode;
    });

    if (typeof supportedHandler === "undefined") {
        // We do not yet support this message code
        log.error(
            `The login handler does not support a message code of ${requestCode}. Was the packet routed here in error?`
        );
        log.error("Closing socket.");
        dataConnection.connection.socket.end();
        throw new TypeError("UNSUPPORTED_MESSAGECODE");
    }

    try {
        const result = await supportedHandler.handler(dataConnection);
    debug(`Returning with ${result.messages.length} messages`);
    debug("Leaving handleData");
    return result;
    } catch (error) {
        log.error(error)
        throw new Error(`Error handling data: ${String(error)}`)
    }
}
