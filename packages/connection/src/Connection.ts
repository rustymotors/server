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

import type { Socket } from "node:net";
import { ServerMessage } from "rusty-motors-shared-packets";
import { getServerMessageProcessor } from "rusty-motors-mcots";
import type { TServerLogger } from "rusty-motors-shared";
import * as Sentry from "@sentry/node";
import { db } from "rusty-motors-database";
import { createCipheriv, createDecipheriv, getCiphers } from "node:crypto";
import { McosEncryptionPair } from "rusty-motors-shared";
import { ClientConnectionManager } from "rusty-motors-mcots";
import { getServerLogger } from "rusty-motors-shared";
import { ErrorNoKey } from "rusty-motors-mcots";

const log = getServerLogger({});

/**
 * This function creates a new encryption pair for use with the game server
 *
 * @param {string} key The key to use for encryption
 * @returns {McosEncryptionPair} The encryption pair
 */
export function createCommandEncryptionPair(key: string): McosEncryptionPair {
    if (key.length < 16) {
        log.error(`Key too short: length ${key.length}, value ${key}`);
        throw Error(`Key too short: length ${key.length}, value ${key}`);
    }

    const sKey = key.slice(0, 16);

    // Deepcode ignore HardcodedSecret: This uses an empty IV
    const desIV = Buffer.alloc(8);

    const gsCipher = createCipheriv("des-cbc", Buffer.from(sKey, "hex"), desIV);
    gsCipher.setAutoPadding(false);

    const gsDecipher = createDecipheriv(
        "des-cbc",
        Buffer.from(sKey, "hex"),
        desIV,
    );
    gsDecipher.setAutoPadding(false);

    return new McosEncryptionPair(gsCipher, gsDecipher);
}

/**
 * This function creates a new encryption pair for use with the database server
 *
 * @param {string} key The key to use for encryption
 * @returns {McosEncryptionPair} The encryption pair
 * @throws Error if the key is too short
 */
export function createDataEncryptionPair(key: string): McosEncryptionPair {
    if (key.length === 0) {
        log.error(`Key is empty: ${key}`);
        throw new ErrorNoKey(`Key is empty: ${key}`);
    }

    if (key.length < 16) {
        log.error(`Key too short: length ${key.length}, value ${key}`);
        throw Error(`Key too short: length ${key.length}, value ${key}`);
    }

    const stringKey = Buffer.from(key, "hex");

    // File deepcode ignore InsecureCipher: RC4 is the encryption algorithum used here, file deepcode ignore HardcodedSecret: A blank IV is used here
    const tsCipher = createCipheriv("rc4", stringKey.subarray(0, 16), "");
    const tsDecipher = createDecipheriv("rc4", stringKey.subarray(0, 16), "");

    return new McosEncryptionPair(tsCipher, tsDecipher);
}

/**
 * This function checks if the server supports the legacy ciphers
 *
 * @returns void
 * @throws Error if the server does not support the legacy ciphers
 */
export function verifyLegacyCipherSupport() {
    const cipherList = getCiphers();
    if (!cipherList.includes("des-cbc")) {
        throw Error("DES-CBC cipher not available");
    }
    if (!cipherList.includes("rc4")) {
        throw Error("RC4 cipher not available");
    }
}

export class Connection {
    private _socket: Socket;
    private _connectionId: string;
    private _logger: TServerLogger;
    private _personaId: number | null = null;
    private _cipherPair: McosEncryptionPair | null = null;
    private _channelSecure: boolean = false;

    getConnectionId() {
        return this._connectionId;
    }

    constructor(socket: Socket, connectionId: string, logger: TServerLogger) {
        this._socket = socket;
        this._connectionId = connectionId;
        this._logger = logger;

        this._socket.on("data", (data) => this.handleServerSocketData(data));
        this._socket.on("error", (error) =>
            handleServerSocketError(this, error),
        );
        this._socket.on("close", () => this.close());

        this._logger.debug(`Connection ${this._connectionId} created`);
    }

    get id(): string {
        return this._connectionId;
    }

    isChannelSecure(): boolean {
        return this._channelSecure;
    }

    setChannelSecure(channelSecure: boolean): void {
        if (channelSecure && this._cipherPair === null) {
            this._logger.error(
                `Tried to set channel secure without a cipher pair for connection ${this._connectionId}`,
            );
            throw new Error(
                `Tried to set channel secure without a cipher pair for connection ${this._connectionId}`,
            );
        }

        this._channelSecure = channelSecure;
        log.debug(
            `Channel secure set to ${this._channelSecure} for connection ${this._connectionId}`,
        );
    }

    private async _getCiperKeyFromDatabase() {
        this._logger.setName("Connection:_getCiperKeyFromDatabase");
        if (this._cipherPair !== null) {
            return;
        }

        if (typeof this._personaId !== "number") {
            this._logger.error(
                `Tried to get cipher key from database without a persona ID`,
            );
            throw new Error(
                `Tried to get cipher key from database without a persona ID`,
            );
        }

        // Get the cipher key from the database
        const session_key = await getDatabase()
            .select()
            .from(keySchema)
            .where(eq(keySchema.userId, this._personaId))
            .then((rows) => {
                if (rows.length < 1 || typeof rows[0] === "undefined") {
                    this._logger.error(
                        `Error getting cipher key from database for persona ID ${this._personaId}`,
                    );
                    throw new Error(
                        `Error getting cipher key from database for persona ID ${this._personaId}`,
                    );
                }

                return rows[0].sessionKey;
            });

        // Set the cipher key
        this._cipherPair = createDataEncryptionPair(session_key);

        this._logger.debug(
            `Got cipher key from database for persona ID ${this._personaId}`,
        );

        this._logger.resetName();
    }

    setCipherPair(cipherPair: McosEncryptionPair) {
        this._cipherPair = cipherPair;
    }

    handleServerSocketData(data: Buffer): void {
        this._logger.setName("Connection:handleSocketData");
        try {
            const message = new ServerMessage(0).deserialize(data);
            log.debug(
                `Received server message with ID ${message.getId()} for connection ${this._connectionId}`,
            );
            this.processServerMessage(message);
        } catch (error) {
            this._logger.error(
                `Error handling socket data for connectionId ${this._connectionId}: ${(error as Error).message}`,
            );
            Sentry.captureException(error);
        }
        this._logger.resetName();
    }

    processServerMessage(message: ServerMessage) {
        this._logger.setName("Connection:processMessage");
        if (message.isEncrypted() && this._cipherPair === null) {
            this._getCiperKeyFromDatabase().catch((error) => {
                this._logger.error(
                    `Error getting cipher key from database for persona ID ${this._personaId}: ${error as string}`,
                );
                Sentry.captureException(error);
            });
        }

        this._logger.debug(`Raw message header: ${message.header.toString()}`);
        this._logger.debug(`Raw message: ${message.toHexString()}`);

        message = this.decryptIfNecessary(message);


        // Lookup the message processor
        const processor = getServerMessageProcessor(message.getId());

        if (processor === undefined) {
            this._logger.error(
                `No server message processor found for message ID ${message.getId()}`,
            );
            return;
        }

        // Process the message
        this._logger.debug(
            `Processing server message with message ID ${message.getId()}, using processor ${processor.name}`,
        );
        processor(
            this._connectionId,
            message,
            this.sendServerMessage.bind(this),
        ).catch((error) => {
            this._logger.error(
                `Error processing message for connectionId ${this._connectionId}: ${error as string}`,
            );
            Sentry.captureException(error);
        });

        this._logger.resetName();
    }

    sendServerMessage(messages: ServerMessage[]) {
        this._logger.setName("Connection:sendMessage");
        this._logger.debug(
            `Sending ${messages.length} messages for connection ${this._connectionId}`,
        );
        try {
            messages.forEach((message) => {
                this._logger.debug(
                    `Sending server message header: ${message.header.toString()}`,
                );
                this._logger.debug(`Server Message: ${message.toHexString()}`);

                message = this.encryptIfNecessary(message);

                if (message.isEncrypted()) {
                    this._logger.debug(
                        `Encrypted Message: ${message.toHexString()}`,
                    );
                }

                this._socket.write(message.serialize());
                if (message.getId() === 0x101) {
                    this.setChannelSecure(true);
                }
            });
        } catch (error) {
            this._logger.error(
                `Error sending server message for connectionId ${this._connectionId}: ${error as string}`,
            );
            Sentry.captureException(error);
        }

        this._logger.debug(
            `Sent ${messages.length} server messages for connection ${this._connectionId}`,
        );

        this._logger.resetName();
    }
    encryptIfNecessary(message: ServerMessage): ServerMessage {
        this._logger.setName("Connection:encryptIfNecessary");
        if (this._channelSecure && !message.isEncrypted()) {
            if (this._cipherPair === null) {
                this._logger.error(
                    `Message should be encrypted but no cipher pair is available for connection ${this._connectionId}`,
                );
                throw new Error(
                    `Message should be encrypted but no cipher pair is available for connection ${this._connectionId}`,
                );
            }
            message = message.encrypt(this._cipherPair);
            message.header.setPayloadEncryption(true);
            this._logger.debug(
                `Encrypted message: message ID ${message.getId()}, prior messsage ID ${message.getPreDecryptedMessageId()}`,
            );
        }
        this._logger.resetName();
        return message;
    }

    close() {
        this._socket.end(() => {
            this._logger.debug(`Connection ${this._connectionId} closed`);
            this._socket.destroy();
            ClientConnectionManager.removeConnection(this._connectionId);
        });
    }


    decryptIfNecessary(message: ServerMessage): ServerMessage {
        this._logger.setName("Connection:decryptIfNecessary");
        if (message.isEncrypted()) {
            if (this._cipherPair === null) {
                this._logger.error(
                    `Message is encrypted but no cipher pair is available for connection ${this._connectionId}`,
                );
                throw new Error(
                    `Message is encrypted but no cipher pair is available for connection ${this._connectionId}`,
                );
            }
            message = message.decrypt(this._cipherPair);
            this._logger.debug(
                `Decrypted message: message ID ${message.getId()}, prior messsage ID ${message.getPreDecryptedMessageId()}`,
            );
            this._logger.debug(`Decrypted message: ${message.toHexString()}`);
        }
        this._logger.resetName();
        return message;
    }

    toString(): string {
        return `Connection ${this._connectionId}, persona ID ${this._personaId}, channel secure ${this._channelSecure}`;
    }
}

export function handleServerSocketError(connection: Connection, error: Error) {
    log.setName("Connection:handleSocketError");
    if (error.message === "ECONNRESET") {
        log.debug(`Connection ${connection.getConnectionId()} reset`);
        return;
    }
    log.error(
        `Socket error: ${error.message} on connection ${connection.getConnectionId()}`,
    );
    Sentry.captureException(error);
    connection.close();
    log.resetName();
}
