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

import { decryptBuffer, selectEncryptors } from "./encryption.js";
import { messageHandlers } from "./handlers.js";
import { MessageNode } from "./MessageNode.js";
import createLogger from 'pino'
import type { Cipher, Decipher } from "node:crypto";
import type { Socket } from "node:net";
import type { BinaryStructure } from "./BinaryStructure.js";
const logger = createLogger()

const log = logger.child({ service: "mcos:transactions" });

/**
 * Convert to zero padded hex
 *
 * @export
 * @param {Buffer} data
 * @return {string}
 */
export function toHex(data: Buffer): string {
    /** @type {string[]} */
    const bytes: string[] = [];
    data.forEach((b) => {
        bytes.push(b.toString(16).toUpperCase().padStart(2, "0"));
    });
    return bytes.join("");
}

export declare type EncryptionSession = {
    connectionId: string;
    remoteAddress: string;
    localPort: number;
    sessionKey: string;
    shortKey: string;
    gsCipher: Cipher;
    gsDecipher: Decipher;
    tsCipher: Cipher;
    tsDecipher: Decipher;
};
/**
 * Socket with connection properties
 */
export declare type SocketWithConnectionInfo = {
    socket: Socket;
    seq: number;
    id: string;
    remoteAddress: string;
    localPort: number;
    personaId: number;
    lastMessageTimestamp: number;
    inQueue: boolean;
    useEncryption: boolean;
    encryptionSession?: EncryptionSession;
};
export declare type BufferWithConnection = {
    connectionId: string;
    connection: SocketWithConnectionInfo;
    data: Buffer;
    timestamp: number;
};

/**
 *
 *
 * @param {MessageNode} message
 * @param {BufferWithConnection} dataConnection
 * @return {boolean}
 */
function shouldMessageBeEncrypted(
    message: MessageNode,
    dataConnection: BufferWithConnection
): boolean {
    return message.flags !== 80 && dataConnection.connection.useEncryption;
}

/**
 *
 *
 * @param {MessageNode} message
 * @param {BufferWithConnection} dataConnection
 * @return {{err: Error | null, data: Buffer | null}}
 */
function decryptTransactionBuffer(
    message: MessageNode,
    dataConnection: BufferWithConnection
): { err: Error | null; data: Buffer | null } {
    const encryptedBuffer = Buffer.from(message.data);
    log.debug(
        `Full packet before decrypting: ${encryptedBuffer.toString("hex")}`
    );

    log.debug(
        `Message buffer before decrypting: ${encryptedBuffer.toString("hex")}`
    );

    const result = decryptBuffer(dataConnection, encryptedBuffer);
    log.debug(
        `Message buffer after decrypting: ${result.data.toString("hex")}`
    );

    if (result.data.readUInt16LE(0) <= 0) {
        return {
            err: new Error("Failure deciphering message, exiting."),
            data: null,
        };
    }
    return { err: null, data: result.data };
}

/**
 *
 *
 * @param {MessageNode} message
 * @param {BufferWithConnection} dataConnection
 * @return {{err: Error | null, data: Buffer | null}}
 */
function tryDecryptBuffer(
    message: MessageNode,
    dataConnection: BufferWithConnection
): { err: Error | null; data: Buffer | null } {
    try {
        return {
            err: null,
            data: decryptTransactionBuffer(message, dataConnection).data,
        };
    } catch (error) {
        return {
            err: new Error(
                `Decrypt() exception thrown! Disconnecting...conId:${
                    dataConnection.connectionId
                }: ${String(error)}`
            ),
            data: null,
        };
    }
}

/**
 * Return the string representation of the numeric opcode
 *
 * @param {number} messageID
 * @return {string}
 */
function _MSG_STRING(messageID: number): string {
    const messageIds = [
        { id: 105, name: "MC_LOGIN" },
        { id: 106, name: "MC_LOGOUT" },
        { id: 109, name: "MC_SET_OPTIONS" },
        { id: 141, name: "MC_STOCK_CAR_INFO" },
        { id: 213, name: "MC_LOGIN_COMPLETE" },
        { id: 266, name: "MC_UPDATE_PLAYER_PHYSICAL" },
        { id: 324, name: "MC_GET_LOBBIES" },
        { id: 325, name: "MC_LOBBIES" },
        { id: 438, name: "MC_CLIENT_CONNECT_MSG" },
        { id: 440, name: "MC_TRACKING_MSG" },
    ];
    const result = messageIds.find((id) => id.id === messageID);

    if (typeof result !== "undefined") {
        return result.name;
    }

    return "Unknown";
}

export type TSMessageBase = BinaryStructure;

/**
 * N+ messages, ready for sending, with related connection
 */
export type TSMessageArrayWithConnection = {
    connection: SocketWithConnectionInfo;
    messages: MessageNode[] | TSMessageBase[];
};

export type TServiceResponse = {
    err: Error | null;
    response?: TSMessageArrayWithConnection | undefined;
};

/**
 * Route or process MCOTS commands
 */
async function processInput(
    dataConnection: BufferWithConnection,
    node: MessageNode
): Promise<TServiceResponse> {
    const currentMessageNo = node.msgNo;
    const currentMessageString = _MSG_STRING(currentMessageNo);

    log.debug(
        `We are attempting to process a message with id ${currentMessageNo}(${currentMessageString})`
    );

    const result = messageHandlers.find(
        (msg) => msg.name === currentMessageString
    );

    if (typeof result !== "undefined") {
        try {
            const responsePackets: TSMessageArrayWithConnection =
                await result.handler(dataConnection.connection, node);
            return {
                err: null,
                response: responsePackets,
            };
        } catch (error) {
            return {
                err: new Error(String(error)),
                response: undefined,
            };
        }
    }

    node.setAppId(dataConnection.connection.personaId);
    return {
        err: new Error(`Message Number Not Handled: ${currentMessageNo} (${currentMessageString})
        conID: ${node.toFrom}  PersonaID: ${node.appId}`),
        response: undefined,
    };
}

async function messageReceived(
    message: MessageNode,
    dataConnection: BufferWithConnection
): Promise<TServiceResponse> {
    // if (message.flags && 0x08) {
    //     selectEncryptors(dataConnection.)
    //   log.debug('Turning on encryption')
    //   newConnection.useEncryption = true
    // }

    // If not a Heartbeat
    if (shouldMessageBeEncrypted(message, dataConnection)) {
        if (
            typeof dataConnection.connection.encryptionSession === "undefined"
        ) {
            const errMessage = `Unabel to locate the encryptors on connection id ${dataConnection.connectionId}`;
            log.error(errMessage);
            throw new Error(errMessage);
        }

        if (message.flags - 8 >= 0) {
            const result = tryDecryptBuffer(message, dataConnection);
            if (result.err !== null || result.data === null) {
                return {
                    err: new Error(String(result.err)),
                    response: undefined,
                };
            }
            // Update the MessageNode with the deciphered buffer
            message.updateBuffer(result.data);
        }
    }

    log.debug("Calling processInput()");
    return processInput(dataConnection, message);
}

/**
 * @param {BufferWithConnection} dataConnection
 * @return {Promise<TSMessageArrayWithConnection>}
 */
export async function handleData(
    dataConnection: BufferWithConnection
): Promise<TSMessageArrayWithConnection> {
    const { connection, data } = dataConnection;
    const { remoteAddress, localPort } = connection.socket;

    if (
        typeof localPort === "undefined" ||
        typeof remoteAddress === "undefined"
    ) {
        const errMessage = `Either localPort or remoteAddress is missing on socket. Can not continue.`;
        log.error(errMessage);
        throw new Error(errMessage);
    }

    const messageNode = new MessageNode("received");
    messageNode.deserialize(data);

    log.debug(
        `[handle]Received TCP packet',
      ${JSON.stringify({
          localPort,
          remoteAddress,
          direction: messageNode.direction,
          data: data.toString("hex"),
      })}`
    );
    messageNode.dumpPacket();

    if (messageNode.flags && 8 > 0) {
        // Message is encrypted, message number is not usable. yet.
        const encrypters: EncryptionSession = selectEncryptors(dataConnection);
        messageNode.updateBuffer(
            encrypters.tsDecipher.update(messageNode.data)
        );
        log.debug(
            `Message number after attempting decryption: ${messageNode.msgNo}`
        );
        log.trace(
            `Raw Packet after decryption: ${toHex(messageNode.rawPacket)}`
        );
    } else {
        log.debug(
            `Message with id of: ${messageNode.msgNo} does not appear to be encrypted`
        );
    }

    const processedPacket = await messageReceived(messageNode, dataConnection);
    log.debug("Back in transacation server");

    if (
        processedPacket.err !== null ||
        typeof processedPacket.response === "undefined"
    ) {
        const errMessage = `Error processing packet: ${processedPacket.err}`;
        log.error(errMessage);
        throw new Error(errMessage);
    }

    return {
        connection: processedPacket.response.connection,
        messages: processedPacket.response.messages,
    };
}
