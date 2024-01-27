import { BareMessage } from "../messageStructs/BareMessage.js";
import fs from "node:fs";
import crypto from "node:crypto";
import { getToken } from "../services/token.js";
import { createNewUserSession, setUserSession } from "../services/session.js";
import { SocketCallback } from "./index.js";
import { MessageContainer } from "../messageStructs/MessageContainer.js";
import { SessionKey } from "../messageStructs/SessionKey.js";
import { getLenString } from "../utils/pureGet.js";
import { UserStatus } from "../messageStructs/UserStatus.js";
import { UserAction } from "../messageStructs/UserAction.js";

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

export function unpackUserLoginMessage(message: BareMessage): {
    sessionKey: string;
    gameId: string;
    contextToken: string;
} {
    // Get the context token
    const ticket = getLenString(message.getData(), 0, false);

    let dataOffset = ticket.length + 2;

    //  The next data structure is a container with an empty id, a length, and a data structure

    // Skip the empty id
    dataOffset += 2;

    // Get the next data length
    const nextDataLength = message.getData().readUInt16BE(dataOffset);

    // This value is the encrypted session key hex, stored as a string
    const encryptedSessionKey = message
        .getData()
        .subarray(dataOffset + 2, dataOffset + 2 + nextDataLength)
        .toString("utf8");

    // Load the private key
    const privateKey = loadPrivateKey("./data/private_key.pem");

    // Decrypt the session key
    const sessionKey = decryptSessionKey(encryptedSessionKey, privateKey);

    // Unpack the session key
    const sessionKeyStructure = SessionKey.fromBytes(
        Buffer.from(sessionKey, "hex"),
    );

    // Update the data offset
    dataOffset += 2 + nextDataLength;

    // Get the next data length
    const nextDataLength2 = message.getData().readUInt16BE(dataOffset);

    // This value is the game id (used by server to identify the game)
    const gameId = message
        .getData()
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

export function processUserLogin(
    connectionId: string,
    message: BareMessage,
    socketCallback: SocketCallback,
): void {
    console.log("User login");

    // Log the message
    console.log(message.getDataAsHex());

    // Unpack the message
    try {
        const { sessionKey, gameId, contextToken } =
            unpackUserLoginMessage(message);

        // Log the context token
        console.log(`Context token: ${contextToken}`);

        // Look up the customer id
        const user = getToken(contextToken);

        // If the user is not found, return an error
        if (user === undefined) {
            console.error("User not found");

            // Create a new message - Not found
            const response = new MessageContainer(0x602, 0x0004);

            // Send the message - twice
            socketCallback([response.toBytes()]);
            socketCallback([response.toBytes()]);

            return;
        }

        // Log the user
        console.log(`User: ${user.customerId}`);

        // Create a new user session
        const userSession = createNewUserSession({
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
        const loginACK = new MessageContainer(0x601, 0x0004);

        // Send the ack
        socketCallback([loginACK.toBytes()]);

        // Create a new UserStatus message
        const userStatus = UserStatus.new();
        userStatus.setCustomerId(user.customerId);
        userStatus.setPersonaId(0);
        userStatus.setBan(new UserAction("ban"));
        userStatus.setGag(new UserAction("gag"));
        userStatus.setSessionKey(SessionKey.fromKeyString(sessionKey));

        // Create a new message - UserStatus
        const userStatusMessage = BareMessage.new(0x601);

        // Log the message
        console.log(userStatusMessage.toHex());

        userStatusMessage.setData(userStatus.toBytes());

        // Log the message
        console.log(userStatusMessage.toHex());

        // Send the message
        socketCallback([userStatusMessage.toBytes()]);

        return;
    } catch (e) {
        console.error(e);
    }
}
