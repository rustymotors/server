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
import { NPSMessage } from "../../mcos-gateway/src/NPSMessage.js";

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
 * @param {import("mcos/shared").TBufferWithConnection} dataConnection
 * @param {import("mcos/shared").TServerLogger} log
 * @return {Promise<import("mcos/shared").TMessageArrayWithConnection>}
 */
async function login(dataConnection, log) {
    const { connectionId, data } = dataConnection;

    log.info(`Received login packet: ${connectionId}`);

    const newGameMessage = new GSMessageBase(log);
    newGameMessage.deserialize(data.subarray(0, 10));
    log.info(`Raw game message: ${JSON.stringify(newGameMessage)}`);

    log.info("Requesting NPSUserStatus packet");
    const userStatus = new NPSUserStatus(data, log);
    log.info("NPSUserStatus packet creation success");

    log.info("Requesting Key extraction");
    userStatus.extractSessionKeyFromPacket(data);
    log.info("Key extraction success");

    const { contextId, sessionkey } = userStatus;

    log.info(
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
        const err = new Error(
            `Unable to locate a user record for the context id: ${contextId}`
        );
        log.error(err);
        throw err;
    }

    // Save sessionkey in database under customerId
    log.info("Preparing to update session key in db");
    await DatabaseManager.getInstance(log)
        .updateSessionKey(
            userRecord.customerId,
            sessionkey,
            contextId,
            connectionId
        )
        .catch((/** @type {unknown} */ error) => {
            const err = new Error(
                `Unable to update session key in the database: ${String(error)}`
            );
            log.error(err);
            throw err;
        });

    log.info("Session key updated");

    // Create the packet content
    // TODO: #1176 Return the login connection response packet as a MessagePacket object
    const packetContent = premadeLogin();
    log.info(`Using Premade Login: ${packetContent.toString("hex")}`);

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
    /** @type {import("mcos/shared").TMessageArrayWithConnection} */
    const response = {
        connection: dataConnection.connection,
        messages: [newPacket, newPacket],
        log
    };
    log.info("Leaving login");
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
 * @param {import("mcos/shared").TBufferWithConnection} dataConnection
 * @param {import("mcos/shared").TServerLogger} log
 * @return {Promise<import("mcos/shared").TMessageArrayWithConnection>}
 */
export async function handleData(dataConnection, log) {
    const { connectionId, data } = dataConnection;

    log.info(`Received Login Server packet: ${connectionId}`);

    // Check the request code
    const requestCode = data.readUInt16BE(0).toString(16);

    const supportedHandler = messageHandlers.find((h) => {
        return h.id === requestCode;
    });

    if (typeof supportedHandler === "undefined") {
        // We do not yet support this message code
        const err = new Error(
            `The login handler does not support a message code of ${requestCode}. Was the packet routed here in error? Closing the socket`
        );
        log.error(err);
        dataConnection.connection.socket.end();
        throw new TypeError(`UNSUPPORTED_MESSAGECODE: ${requestCode}`);
    }

    try {
        const result = await supportedHandler.handler(dataConnection, log);
        log.info(`Returning with ${result.messages.length} messages`);
        log.info("Leaving handleData");
        return result;
    } catch (error) {
        throw new Error(`Error handling data: ${String(error)}`);
    }
}
