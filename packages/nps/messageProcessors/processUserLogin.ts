import { ISerializable } from "../types.js";
import { GameMessage } from "../messageStructs/GameMessage.js";
import fs from "node:fs";
import crypto from "node:crypto";
import * as Sentry from "@sentry/node";
import { getToken } from "../services/token.js";
import { createNewUserSession, setUserSession } from "../services/session.js";
import { SocketCallback } from "./index.js";
import { SessionKey } from "../messageStructs/SessionKey.js";
import { getAsHex, getLenString } from "../utils/pureGet.js";
import { UserStatus } from "../messageStructs/UserStatus.js";
import { UserAction } from "../messageStructs/UserAction.js";
import { getServerConfiguration, getServerLogger } from "@rustymotors/shared";

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

    // Unpack the session key
    const sessionKeyStructure = SessionKey.fromBytes(
        Buffer.from(sessionKey, "hex"),
    );

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

    // Return the session key, game id, and context token
    return {
        sessionKey: sessionKeyStructure.getKey(),
        gameId,
        contextToken: ticket,
    };
}

export async function processUserLogin(
    connectionId: string,
    message: GameMessage,
    socketCallback: SocketCallback,
): Promise<void> {
    Sentry.startSpan(
        {
            name: "processUserLogin",
            op: "processUserLogin",
        },
        async (span) => {
            // Log the message
            log.info(`User login request: ${message.toString()}`);

            // Unpack the message
            try {
                const { sessionKey, gameId, contextToken } =
                    unpackUserLoginMessage(message.getData());

                // Log the context token
                log.info(`Context token: ${contextToken}`);

                // Look up the customer id
                const user = getToken(contextToken);

                // If the user is not found, return an error
                if (user === undefined) {
                    console.error("User not found");

                    // Create a new message - Not found
                    const response = new GameMessage(0);
                    response.header.setId(0x602);

                    // Send the message - twice
                    Sentry.startSpan(
                        {
                            name: "socketCallback",
                            op: "socketCallback",
                        },
                        (span) => {
                            socketCallback([response.serialize()]);
                        },
                    );
                    Sentry.startSpan(
                        {
                            name: "socketCallback",
                            op: "socketCallback",
                        },
                        (span) => {
                            socketCallback([response.serialize()]);
                        },
                    );

                    return;
                }

                // Log the user
                log.info(`User: ${user.customerId}`);

                // Create a new user session
                const userSession = await createNewUserSession({
                    customerId: user.customerId,
                    token: contextToken,
                    connectionId,
                    port: 0,
                    ipAddress: "",
                    activeProfileId: 0,
                    nextSequenceNumber: 0,
                    sessionKey,
                    clientVersion: "unknown",
                });

                // Save the user session
                setUserSession(userSession);

                // Create a new message - Login ACK
                const loginACK = new GameMessage(0);
                loginACK.header.setId(0x601);

                // Send the ack
                socketCallback([loginACK.serialize()]);

                // Create a new UserStatus message
                const userStatus = UserStatus.new();
                userStatus.setCustomerId(user.customerId);
                userStatus.setPersonaId(0);
                userStatus.setBan(new UserAction("ban"));
                userStatus.setGag(new UserAction("gag"));
                userStatus.setSessionKey(SessionKey.fromKeyString(sessionKey));

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
}
