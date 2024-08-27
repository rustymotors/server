import { createCipheriv, createDecipheriv } from "node:crypto";

/**
 * Represents a pair of encryption and decryption functions.
 */
type CipherPair = {
    /** The encryption function */
    encrypt: (data: Buffer) => Buffer;
    /** The decryption function */
    decrypt: (data: Buffer) => Buffer;
};

/**
 * Generates a pair of cipher and decipher functions for game encryption.
 * @returns The cipher and decipher functions.
 */
function createGameEncryptionPair(key: string): CipherPair {
    try {
        assertStringIsHex(key);
        if (key.length !== 16) {
            throw Error(
                `Invalid game key length: ${key.length}. The key must be 16 bytes long.`,
            );
        }

        // The key used by the game 8 bytes long.
        // Since the key is in hex format, we need to slice it to 16 characters.
        key = key.slice(0, 16);

        // The IV is intentionally required to be all zeros.
        const iv = Buffer.alloc(8);
        const keyBuffer = Buffer.from(key, "hex");

        // The algorithm is intentionally set to "des-cbc".
        // This is because the game uses this insecure algorithm.
        // We are intentionally using an insecure algorithm here to match the game.
        const cipher = createCipheriv("des-cbc", keyBuffer, iv);
        const decipher = createDecipheriv("des-cbc", keyBuffer, iv);

        return {
            encrypt: cipher.update.bind(cipher),
            decrypt: decipher.update.bind(decipher),
        };
    } catch (error: unknown) {
        const err = new Error(`Failed to create game encryption pair`);
        err.cause = error;
        throw err;
    }
}

/**
 * Generates a pair of encryption and decryption functions for the server.
 *
 * @param key - The key to use for encryption and decryption. Must be 16 hex characters.
 * @returns {CipherPair} The encryption and decryption functions.
 */
function createServerEncryptionPair(key: string): CipherPair {
    try {
        assertStringExists(key);
        assertStringIsHex(key);
        if (key.length !== 16) {
            throw Error(
                `Invalid server key length: ${key.length}. The key must be 16 bytes long.`,
            );
        }

        // The IV is intentionally required to be empty.
        const iv = Buffer.alloc(0);
        const keyBuffer = Buffer.from(key, "hex");

        // The algorithm is intentionally set to "rc4".
        // This is because the game uses this insecure algorithm.
        // We are intentionally using an insecure algorithm here to match the game.
        const cipher = createCipheriv("rc4", keyBuffer, iv);
        const decipher = createDecipheriv("rc4", keyBuffer, iv);

        return {
            encrypt: cipher.update.bind(cipher),
            decrypt: decipher.update.bind(decipher),
        };
    } catch (error: unknown) {
        const err = new Error(`Failed to create server encryption pair`);
        err.cause = error;
        throw err;
    }
}

type ConnectedClient = {
    /** The connection ID for the client */
    connectionId: string;
    /** The customer ID for the client */
    customerId: number;
    /** The session key for the client */
    sessionKey?: string;
    /** The game encryption pair for the client, if known */
    gameEncryptionPair?: ReturnType<typeof createGameEncryptionPair>;
    /** The server encryption pair for the client, if known */
    serverEncryptionPair?: ReturnType<typeof createServerEncryptionPair>;
    /** Whether the game encryption handshake is complete */
    gameEncryptionHandshakeComplete: boolean;
    /** Whether the server encryption handshake is complete */
    serverEncryptionHandshakeComplete: boolean;
};

/**
 * Sets the client encryption for a connected client.
 *
 * @param client - The connected client to set the encryption for.
 * @param sessionKey - The session key to associate with the client.
 * @returns The updated connected client with the encryption set.
 */
export function setClientEncryption(
    client: ConnectedClient,
    sessionKey: string,
): ConnectedClient {
    try {
        const gameEncryptionPair = createGameEncryptionPair(sessionKey);
        const serverEncryptionPair = createServerEncryptionPair(sessionKey);
        client.sessionKey = sessionKey;
        client.gameEncryptionPair = gameEncryptionPair;
        client.serverEncryptionPair = serverEncryptionPair;
    } catch (error: unknown) {
        const err = new Error(`Failed to set client encryption`);
        err.cause = error;
        throw err;
    }
    return client;
}

/**
 * Represents a record of connected clients.
 * The key is the connection ID.
 * The value is the connected client.
 */
const connectedClients: Record<string, ConnectedClient> = {};

/**
 * Finds a connected client by their customer ID.
 *
 * @param customerId - The customer ID to search for.
 * @returns The connected client with the specified customer ID.
 * @throws Error if no client is found with the given customer ID.
 */
export function findClientByCustomerId(customerId: number): ConnectedClient {
    const client = Object.values(connectedClients).find(
        (client) => client.customerId === customerId,
    );
    if (typeof client === "undefined") {
        throw new Error(`Client with customer ID ${customerId} not found`);
    }
    return client;
}

type connectionType = "game" | "server";

/**
 * Checks if a client has an encryption pair based on the connection type.
 * @param client - The connected client.
 * @param connectionType - The type of connection ("game" or "server").
 * @returns A boolean indicating whether the client has an encryption pair.
 */
export function hasClientEncryptionPair(
    client: ConnectedClient,
    connectionType: connectionType,
): boolean {
    if (connectionType === "game") {
        return !!client.gameEncryptionPair;
    } else {
        return !!client.serverEncryptionPair;
    }
}

/**
 * Creates a new client connection.
 *
 * @param connectionId - The ID of the connection.
 * @param customerId - The ID of the customer.
 * @param sessionKey - The session key (optional).
 * @returns A ConnectedClient object representing the new client connection.
 */
export function newClientConnection(
    connectionId: string,
    customerId: number,
    sessionKey?: string,
): ConnectedClient {
    return {
        connectionId,
        customerId,
        sessionKey,
        gameEncryptionHandshakeComplete: false,
        serverEncryptionHandshakeComplete: false,
    };
}

/**
 * Saves the client connection with the specified connection ID.
 *
 * @param connectionId - The ID of the connection.
 * @param client - The connected client to be saved.
 */
export function saveClientConnection(
    connectionId: string,
    client: ConnectedClient,
): void {
    connectedClients[connectionId] = client;
}

/**
 * Clears all connected clients.
 */
export function clearConnectedClients(): void {
    for (const connectionId in connectedClients) {
        delete connectedClients[connectionId];
    }
}

function assertStringExists(str: string): void {
    if (str === "" || typeof str === "undefined") {
        throw new Error("String not provided");
    }
}

/**
 * Asserts that a given string is a valid hexadecimal string.
 *
 * @param str - The string to be validated.
 * @throws {Error} If the string is not a valid hexadecimal string.
 */
function assertStringIsHex(str: string): void {
    if (!/^[0-9a-fA-F]+$/.test(str)) {
        throw new Error(`Invalid hex string: ${str}`);
    }
}
