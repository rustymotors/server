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

import { GSMessageBase } from "@mcos/gateway";
import { NPSMessage, Sentry } from "@mcos/shared";
import { DatabaseManager } from "@mcos/database";
import { NPSUserStatus } from "./NPSUserStatus.js";
import { premadeLogin } from "./premadeLogin.js";
import {
    UserRecordMini,
    TBufferWithConnection,
    ServerConfiguration,
    Logger,
    MessageArrayWithConnectionInfo,
    ServiceArgs,
} from "@mcos/interfaces";

/** @type {UserRecordMini[]} */
const userRecords: UserRecordMini[] = [
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
 * @param {TBufferWithConnection} dataConnection
 * @param {ServerConfiguration} config
 * @param {Logger} log
 * @return {Promise<MessageArrayWithConnectionInfo>}
 */
async function login(
    dataConnection: TBufferWithConnection,
    config: ServerConfiguration,
    log: Logger,
): Promise<MessageArrayWithConnectionInfo> {
    const { connectionId, data } = dataConnection;

    log("debug", `Received login packet: ${connectionId}`);

    const newGameMessage = new GSMessageBase(log);
    newGameMessage.deserialize(data.subarray(0, 10));
    log("debug", `Raw game message: ${JSON.stringify(newGameMessage)}`);

    log("debug", "Requesting NPSUserStatus packet");
    const userStatus = new NPSUserStatus(data, config, log);
    log("debug", "NPSUserStatus packet creation success");

    log("debug", "Requesting Key extraction");
    userStatus.extractSessionKeyFromPacket(data);
    log("debug", "Key extraction success");

    const { contextId, sessionKey } = userStatus;

    log(
        "debug",
        `UserStatus object from _userLogin,
      ${JSON.stringify({
          userStatus: userStatus.toJSON(),
      })}`,
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
            `Unable to locate a user record for the context id: ${contextId}`,
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }

    // Save sessionkey in database under customerId
    log("debug", "Preparing to update session key in db");
    await DatabaseManager.getInstance(log)
        .updateSessionKey(
            userRecord.customerId,
            sessionKey ?? "",
            contextId,
            connectionId,
        )
        .catch((/** @type {unknown} */ error: unknown) => {
            Sentry.captureException(error);
            const err = new Error(
                `Unable to update session key in the database: ${String(
                    error,
                )}`,
            );
            Sentry.addBreadcrumb({ level: "error", message: err.message });
            throw err;
        });

    log("debug", "Session key updated");

    // Create the packet content
    // TODO: #1176 Return the login connection response packet as a MessagePacket object
    const packetContent = premadeLogin();
    log("debug", `Using Premade Login: ${packetContent.toString("hex")}`);

    // MsgId: 0x601 = NPS_USER_VALID = 1537
    Buffer.from([0x06, 0x01]).copy(packetContent);

    // GLDB_User_Status
    // packet structure
    // msgId: 0x0601 = NPS_USER_VALID = 1537 = 2 bytes
    // packetLength: 0x0100 = 256 = 2 bytes
    // customerId: 0x00000000 = 4 bytes
    // personaId: 0x00000000 = 4 bytes
    // isCacheHit: 0x00 = 1 byte
    // ban: 0x00 = 1 byte
    // gag: 0x00 = 1 byte
    // sessionKey: 0x00000000000 = 12 bytes
    // pack size in bytes: 26
    //

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
    /** @type {MessageArrayWithConnectionInfo} */
    const response: MessageArrayWithConnectionInfo = {
        connection: dataConnection.connection,
        messages: [newPacket, newPacket],
        log,
    };
    log("debug", "Leaving login");
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
 * @param {TBufferWithConnection} dataConnection
 * @param {ServerConfiguration} config
 * @param {Logger} log
 * @return {Promise<MessageArrayWithConnectionInfo>}
 */
export async function handleData(
    args: ServiceArgs,
): Promise<MessageArrayWithConnectionInfo> {
    const { legacyConnection: dataConnection, config, log } = args;
    const { connectionId, data } = dataConnection;

    log("debug", `Received Login Server packet: ${connectionId}`);

    // Check the request code
    const requestCode = data.readUInt16BE(0).toString(16);

    const supportedHandler = messageHandlers.find((h) => {
        return h.id === requestCode;
    });

    if (typeof supportedHandler === "undefined") {
        // We do not yet support this message code
        let err = new Error(
            `The login handler does not support a message code of ${requestCode}. Was the packet routed here in error? Closing the socket`,
        );
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        dataConnection.connection.socket.end();
        err = new TypeError(`UNSUPPORTED_MESSAGECODE: ${requestCode}`);
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }

    try {
        const result = await supportedHandler.handler(
            dataConnection,
            config,
            log,
        );
        log("debug", `Returning with ${result.messages.length} messages`);
        log("debug", "Leaving handleData");
        return result;
    } catch (error) {
        Sentry.captureException(error);
        const err = new Error(`Error handling data: ${String(error)}`);
        Sentry.addBreadcrumb({ level: "error", message: err.message });
        throw err;
    }
}
