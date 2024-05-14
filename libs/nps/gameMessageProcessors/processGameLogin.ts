import type { ISerializable } from "../types.js";
import { GameMessage } from "../messageStructs/GameMessage.js";
import fs from "node:fs";
import crypto from "node:crypto";
import * as Sentry from "@sentry/node";
import { getToken } from "../services/token.js";
import type { GameSocketCallback } from "./index.js";
import { SessionKey } from "../messageStructs/SessionKey.js";
import { getAsHex, getLenString } from "../src/utils/pureGet.js";
import { UserStatus } from "../messageStructs/UserStatus.js";
import { getServerConfiguration, getServerLogger } from "rusty-motors-shared";
import { UserStatusManager } from "../src/UserStatusManager.js";

const log = getServerLogger();

export function loadPrivateKey(path: string): string {
    const privateKey = fs.readFileSync(path);

    return privateKey.toString("utf8");
}

export function decryptSessionKey(
    encryptedSessionKey: string,
    privateKey: string,
): string {
    const sessionKeyStructure = crypto.privateDecrypt(
        privateKey,
        Buffer.from(encryptedSessionKey, "hex"),
    );

    return sessionKeyStructure.toString("hex");
}

export function unpackUserLoginMessage(message: ISerializable): {
    sessionKey: string;
    gameId: string;
    contextToken: string;
} {
    log.setName("nps:unpackUserLoginMessage");
    log.info(`Unpacking user login message: ${getAsHex(message.serialize())}`);

    // Get the context token
    const ticket = getLenString(message.serialize(), 0, false);

    let dataOffset = ticket.length + 2;

    //  The next data structure is a container with an empty id, a length, and a data structure

    // Skip the empty id
    dataOffset += 2;

    // Get the next data length
    const nextDataLength = message.serialize().readUInt16BE(dataOffset);

    // This value is the encrypted session key hex, stored as a string
    const encryptedSessionKey = message
        .serialize()
        .subarray(dataOffset + 2, dataOffset + 2 + nextDataLength)
        .toString("utf8");

    // Load the private key
    const privateKey = loadPrivateKey(
        getServerConfiguration({}).privateKeyFile,
    );

    // Decrypt the session key
    const sessionKey = decryptSessionKey(encryptedSessionKey, privateKey);

    log.info(`Decrypted session key: ${getAsHex(Buffer.from(sessionKey, "hex"))}`);

    // Unpack the session key
    const sessionKeyStructure = SessionKey.fromBytes(
        Buffer.from(sessionKey, "hex"),
    );

    log.info(`Session key structure: ${sessionKeyStructure.toString()}`);

    // Update the data offset
    dataOffset += 2 + nextDataLength;

    // Get the next data length
    const nextDataLength2 = message.serialize().readUInt16BE(dataOffset);

    // This value is the game id (used by server to identify the game)
    const gameId = message
        .serialize()
        .subarray(dataOffset + 2, dataOffset + 2 + nextDataLength2)
        .toString("utf8");

    // Update the data offset
    dataOffset += 2 + nextDataLength2;

    log.resetName();

    // Return the session key, game id, and context token
    return {
        sessionKey: sessionKeyStructure.getKey(),
        gameId,
        contextToken: ticket,
    };
}

/**
 * This is the initial connection to the Login server
 */
export async function processGameLogin(
    connectionId: string,
    userStatus: UserStatus,
    message: GameMessage,
    socketCallback: GameSocketCallback,
): Promise<void> {
    Sentry.startSpan(
        {
            name: "processLogin",
            op: "processLogin",
        },
        () => {
            log.setName("nps:processLogin");

            log.info(`Login: ${message.toString()}`);

            // Unpack the message
            try {
                const { sessionKey, contextToken } =
                    unpackUserLoginMessage(message.getData());

                // Log the context token
                log.info(`Context token: ${contextToken}`);

                // Log the session key
                log.info(`Session key: ${sessionKey}`);

                // Look up the customer id
                const user = getToken(contextToken);

                // If the user is not found, return an error
                if (user === undefined) {
                    log.error(`User not found for context token: ${contextToken}`);

                    // Create a new message - Not found
                    const response = new GameMessage(0);
                    response.header.setId(0x602);

                    // Send the message - twice
                    Sentry.startSpan(
                        {
                            name: "socketCallback",
                            op: "socketCallback",
                        },
                        () => {
                            socketCallback([response.serialize()]);
                        },
                    );
                    Sentry.startSpan(
                        {
                            name: "socketCallback",
                            op: "socketCallback",
                        },
                        () => {
                            socketCallback([response.serialize()]);
                        },
                    );

                    return;
                }

                // Log the user
                log.info(`User: ${user.customerId}`);

                // Create a new message - Login ACK
                const loginACK = new GameMessage(0);
                loginACK.header.setId(0x601);

                // Send the ack
                socketCallback([loginACK.serialize()]);

                // Create a new UserStatus message
                const userStatus = UserStatus.new();
                userStatus.setCustomerId(user.customerId);
                userStatus.setPersonaId(0);
                userStatus.ban.set({
                    initiator: "Molly",
                    startComment: "Because I said so",
                });
                userStatus.setSessionKey(SessionKey.fromKeyString(sessionKey));

                UserStatusManager.addUserStatus(userStatus);

                // Create a new message - UserStatus
                const userStatusMessage = new GameMessage(257);
                userStatusMessage.header.setId(0x601);

                userStatusMessage.setData(userStatus);

                // Log the message
                log.info(`UserStatus: ${userStatusMessage.toString()}`);

                // Send the message
                socketCallback([userStatusMessage.serialize()]);
                socketCallback([userStatusMessage.serialize()]);

                return;
            } catch (e) {
                console.error(e);
            }
        },
    );
    log.resetName();
    return Promise.resolve();
}
