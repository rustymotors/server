import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

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
function createGameEncryptionPair(): CipherPair {
    const key = randomBytes(32);
    const iv = randomBytes(16);
    const cipher = createCipheriv("aes-256-cbc", key, iv);
    const decipher = createDecipheriv("aes-256-cbc", key, iv);
    return {
        encrypt: cipher.update.bind(cipher),
        decrypt: decipher.update.bind(decipher),
    };
}

/**
 * Generates a pair of encryption and decryption functions for the server.
 * 
 * @returns {CipherPair} The encryption and decryption functions.
 */
function createServerEncryptionPair(): CipherPair {
    const key = randomBytes(32);
    const iv = randomBytes(16);
    const cipher = createCipheriv("aes-256-cbc", key, iv);
    const decipher = createDecipheriv("aes-256-cbc", key, iv);
    return {
        encrypt: cipher.update.bind(cipher),
        decrypt: decipher.update.bind(decipher),
    };
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
export function setClientEncryption(client: ConnectedClient, sessionKey: string): ConnectedClient {
    const gameEncryptionPair = createGameEncryptionPair();
    const serverEncryptionPair = createServerEncryptionPair();
    client.sessionKey = sessionKey;
    client.gameEncryptionPair = gameEncryptionPair;
    client.serverEncryptionPair = serverEncryptionPair;
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
export function findClientByCustomerId(
    customerId: number,
): ConnectedClient {
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
