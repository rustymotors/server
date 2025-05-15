import crypto from 'node:crypto';
import fs from 'node:fs';
import { GameMessage } from '../messageStructs/GameMessage.js';
import { SessionKey } from '../messageStructs/SessionKey.js';
import { getLenString } from '../src/utils/pureGet.js';
import type { GameSocketCallback } from './index.js';

import type { UserStatus } from '../messageStructs/UserStatus.js';
import { getServerLogger } from 'rusty-motors-logger';

const defaultLogger = getServerLogger('nps.processDeleteProfile');

/**
 * Loads a private key file from the specified path and returns its contents as a UTF-8 string.
 *
 * @param path - Filesystem path to the private key file.
 * @returns The private key as a UTF-8 encoded string.
 */
export function loadPrivateKey(path: string): string {
    const privateKey = fs.readFileSync(path);

    return privateKey.toString('utf8');
}

/**
 * Decrypts an encrypted session key using the provided private key.
 *
 * @param encryptedSessionKey - The session key as a hex-encoded string.
 * @param privateKey - The PEM-formatted private key used for decryption.
 * @returns The decrypted session key as a hex-encoded string.
 */
export function decryptSessionKey(
    encryptedSessionKey: string,
    privateKey: string,
): string {
    const sessionKeyStructure = crypto.privateDecrypt(
        privateKey,
        Buffer.from(encryptedSessionKey, 'hex'),
    );

    return sessionKeyStructure.toString('hex');
}

/**
 * Extracts and decrypts the session key, game ID, and context token from a user login message.
 *
 * @param message - The {@link GameMessage} containing the login data.
 * @returns An object with the decrypted session key, game ID, and context token.
 *
 * @remark The private key is loaded from a fixed path ('./data/private_key.pem') to decrypt the session key.
 */
export function unpackUserLoginMessage(message: GameMessage): {
    sessionKey: string;
    gameId: string;
    contextToken: string;
} {
    // Get the context token
    const ticket = getLenString(message.getDataAsBuffer(), 0, false);

    let dataOffset = ticket.length + 2;

    //  The next data structure is a container with an empty id, a length, and a data structure

    // Skip the empty id
    dataOffset += 2;

    // Get the next data length
    const nextDataLength = message.getDataAsBuffer().readUInt16BE(dataOffset);

    // This value is the encrypted session key hex, stored as a string
    const encryptedSessionKey = message
        .getDataAsBuffer()
        .subarray(dataOffset + 2, dataOffset + 2 + nextDataLength)
        .toString('utf8');

    // Load the private key
    const privateKey = loadPrivateKey('./data/private_key.pem');

    // Decrypt the session key
    const sessionKey = decryptSessionKey(encryptedSessionKey, privateKey);

    // Unpack the session key
    const sessionKeyStructure = SessionKey.fromBytes(
        Buffer.from(sessionKey, 'hex'),
    );

    // Update the data offset
    dataOffset += 2 + nextDataLength;

    // Get the next data length
    const nextDataLength2 = message.getDataAsBuffer().readUInt16BE(dataOffset);

    // This value is the game id (used by server to identify the game)
    const gameId = message
        .getDataAsBuffer()
        .subarray(dataOffset + 2, dataOffset + 2 + nextDataLength2)
        .toString('utf8');

    // Update the data offset
    dataOffset += 2 + nextDataLength2;

    // Return the session key, game id, and context token
    return {
        sessionKey: sessionKeyStructure.getKey(),
        gameId,
        contextToken: ticket,
    };
}

/**
 * Handles a user profile deletion request and sends a login acknowledgment response.
 *
 * @param message - The incoming game message representing the delete profile request.
 * @param socketCallback - Callback used to send the acknowledgment message back to the client.
 *
 * @remark
 * The actual profile deletion logic is not implemented; only an acknowledgment is sent.
 */
export async function processDeleteProfile(
    _connectionId: string,
    _userStatus: UserStatus,
    message: GameMessage,
    socketCallback: GameSocketCallback,
): Promise<void> {
    defaultLogger.debug('processDeleteProfile called');
    // Log the message
    defaultLogger.info(`Delete profile request: ${message.toString()}`);

    // TODO: Delete the profile

    // Create a new message - Login ACK
    const loginACK = new GameMessage(0);
    loginACK.header.setId(0x60c);

    // Send the ack
    socketCallback([loginACK.serialize()]);
    return Promise.resolve();
}
