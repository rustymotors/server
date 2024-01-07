import { BareMessage } from "../BareMessage.js";
import fs from "node:fs";
import crypto from "node:crypto";

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

export class SessionKey {
    private key: Buffer;
    private timestamp: number;

    constructor(key: Buffer, timestamp: number) {
        this.key = key;
        this.timestamp = timestamp;
    }

    static fromBytes(bytes: Buffer): SessionKey {
        const keyLength = bytes.readUInt16BE(0);

        // Set the data offset
        let dataOffset = 2 + keyLength;

        const key = bytes.subarray(2, dataOffset);

        // Get the timestamp
        const timestamp = bytes.readUInt32BE(dataOffset);

        return new SessionKey(key, timestamp);
    }

    getKey(): string {
        return this.key.toString("hex");
    }

    toString(): string {
        return `Key: ${this.key.toString("hex")}, Timestamp: ${this.timestamp}`;
    }
}

export function unpackUserLoginMessage(message: BareMessage): {
    sessionKey: string;
    gameId: string;
    contextToken: string;
} {
    // Get the context token
    const contextTokenLength = message.getData().readUInt16BE(0);

    // Set the data offset
    let dataOffset = 2 + contextTokenLength;

    // Get the context token
    const contextToken = message
        .getData()
        .subarray(2, dataOffset)
        .toString("utf8");

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
        contextToken,
    };
}

export function processUserLogin(
    connectionId: string,
    message: BareMessage,
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
    } catch (e) {
        console.error(e);
    }
}
