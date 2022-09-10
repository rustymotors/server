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

import { logger } from "mcos-logger/src/index.js";
import { GSMessageBase } from "./GMessageBase.js";
import { NPSUserStatus } from "./NPSUserStatus.js";
import { premadeLogin } from "./premadeLogin.js";
import { NPSMessage } from "./NPSMessage.js";
import type { UserRecordMini } from "mcos-types/types.js";
import { Connection, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const log = logger.child({ service: "mcos:login" });

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
 * @param {Connection} connection
 * @param {Buffer} data
 * @return {Promise<Buffer>}
 */
async function login(connection: Connection, data: Buffer): Promise<Buffer> {
    log.info(`Received login packet: ${connection.id}`);

    const newGameMessage = new GSMessageBase();
    newGameMessage.deserialize(data.subarray(0, 10));
    log.trace(`Raw game message: ${JSON.stringify(newGameMessage)}`);

    const userStatus = new NPSUserStatus(data);

    userStatus.extractSessionKeyFromPacket(data);

    const { contextId, sessionkey } = userStatus;

    log.debug(
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
    log.debug("Preparing to update session key in db");
    try {
        const skey = sessionkey.slice(0, 16);
        await prisma.session.upsert({
            where: {
                customerId: connection.customerId,
            },
            update: {
                sessionKey: sessionkey,
                sKey: skey,
                contextId: contextId,
            },
            create: {
                customerId: connection.customerId,
                sessionKey: sessionkey,
                sKey: skey,
                contextId: contextId,
                connectionId: connection.id,
            },
        });
    } catch (error) {
        log.error(`Unable to update session key 3: ${String(error)}`);
        throw new Error("Error in userLogin");
    }

    log.info("Session key updated");

    // Create the packet content
    // TODO: #1176 Return the login connection response packet as a MessagePacket object
    const packetContent = premadeLogin();
    log.debug(`Using Premade Login: ${packetContent.toString("hex")}`);

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
     */

    log.debug("Leaving login");
    // return Buffer.concat([newPacket.serialize(), newPacket.serialize()]);
    return Buffer.concat([newPacket.serialize(), newPacket.serialize()]);
}

export const messageHandlers = [
    {
        id: "501",
        handler: login,
    },
];

/**
 *
 * @param {Connection} connection
 * @param {Buffer} data
 * @return {Promise<Buffer>}
 */
export async function handleData(
    connection: Connection,
    data: Buffer
): Promise<Buffer> {
    log.info(`Received Login Server packet: ${connection.id}`);

    // Check the request code
    const requestCode = data.readUInt16BE(0).toString(16);

    const supportedHandler = messageHandlers.find((h) => {
        return h.id === requestCode;
    });

    if (typeof supportedHandler === "undefined") {
        // We do not yet support this message code
        throw new Error(
            `The login handler does not support a message code of ${requestCode}. Was the packet routed here in error?`
        );
    }

    const result = await supportedHandler.handler(connection, data);
    log.trace(`Returning with ${result.length} messages`);
    log.debug("Leaving handleData");
    return result;
}
