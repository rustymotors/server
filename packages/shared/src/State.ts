/**
 * @fileoverview State management for the gateway server.
 * @module shared/state
 * @exports GatewayServer/State
 *
 */

// eslint-disable-next-line no-unused-vars
import { Cipher, Decipher } from 'crypto';
import { SerializedBufferOld } from './SerializedBufferOld.js';
import { BufferSerializer } from 'rusty-motors-shared-packets';
import { ServerLogger } from 'rusty-motors-logger';

/**
 * State management for the gateway server.
 *
 * This file contains the state management for the gateway server. It is
 * responsible for keeping track of the state of the server, including
 * connections, encryption, and sessions.
 *
 * @example
 * ```ts
 * import { createInitialState, addSocket, removeSocket } from "./state.js";
 *
 * const state = createInitialState();
 *
 * const wrappedSocket = wrapSocket(socket, connectionId);
 *
 *
 *
 */

/**
 * @external crypto
 * @see {@link https://nodejs.org/api/crypto.html}
 */

/**
 * A pair of encryption ciphers.
 */
export class McosEncryptionPair {
    _cipher: Cipher;
    _decipher: Decipher;
    /**
     * Create a new encryption pair.
     *
     * This function creates a new encryption pair. It is used to encrypt and
     * decrypt data sent to and from the client.
     *
     * @param {module:crypto.Cipher} cipher The cipher to use for encryption.
     * @param {module:crypto.Decipher} decipher The decipher to use for decryption.
     */
    constructor(cipher: Cipher, decipher: Decipher) {
        this._cipher = cipher;
        this._decipher = decipher;
    }

    /**
     * @param {Buffer} data The data to encrypt.
     * @returns {Buffer} The encrypted data.
     */
    encrypt(data: Buffer): Buffer {
        return this._cipher.update(data);
    }

    /**
     * @param {Buffer} data The data to decrypt.
     * @returns {Buffer} The decrypted data.
     */
    decrypt(data: Buffer): Buffer {
        return this._decipher.update(data);
    }
}

/**
 * The encryption settings for a session.
 */
export class McosEncryption {
    connectionId: string;
    _commandEncryptionPair: McosEncryptionPair;
    _dataEncryptionPair: McosEncryptionPair;
    /**
     * Create a new encryption object.
     *
     * @param {object} args
     * @param {string} args.connectionId The connection id of the session that
     *                                   this encryption is for.
     * @param {McosEncryptionPair} args.commandEncryptionPair The encryption
     *                                                        pair for
     *                                                       command packets.
     * @param {McosEncryptionPair} args.dataEncryptionPair The encryption pair
     *                                                    for data packets.
     */
    constructor({
        connectionId,
        commandEncryptionPair,
        dataEncryptionPair,
    }: {
        connectionId: string;
        commandEncryptionPair: McosEncryptionPair;
        dataEncryptionPair: McosEncryptionPair;
    }) {
        this.connectionId = connectionId;
        this._commandEncryptionPair = commandEncryptionPair;
        this._dataEncryptionPair = dataEncryptionPair;
    }

    get commandEncryption() {
        return this._commandEncryptionPair;
    }

    get dataEncryption() {
        return this._dataEncryptionPair;
    }
}

/**
 * A client session.
 */
export class McosSession {
    connectionId: string;
    gameId: number;
    /**
     * Create a new session.
     *
     * @param {object} args
     * @param {string} args.connectionId A unique identifier for this session.
     * @param {number} args.username The username of the user who owns this
     *                              session.
     */
    constructor({
        connectionId,
        gameId,
    }: {
        connectionId: string;
        gameId: number;
    }) {
        this.connectionId = connectionId;
        this.gameId = gameId;
    }
}

type OnDataHandlerArgs = {
    connectionId: string;
    message: BufferSerializer;
    log?: ServerLogger;
};

export interface ServiceResponse {
    connectionId: string;
    messages: SerializedBufferOld[];
}

export type OnDataHandler = (
    args: OnDataHandlerArgs,
) => Promise<ServiceResponse>;
/**
 * @param {OnDataHandlerArgs} args The arguments for the handler.
 * @returns {ServiceResponse} The
 *                                                                     response
 *                                                                  to the
 *                                                            data.
 */

/**
 * @param {State} state The state to save.
 * @returns {void}
 */

/**
 * The state of the gateway server.
 *
 * This is the state of the gateway server. It is responsible for keeping track
 * of the state of the server, including connections, encryption, and sessions.
 * @global
 * @interface
 */
export interface State {
    filePaths: Record<string, string>;
    // sockets: Record<string, WrappedSocket>;
    encryptions: Record<string, McosEncryption>;
    sessions: Record<string, McosSession>;
    // queuedConnections: Record<string, WrappedSocket>;
    save: (state?: State) => void;
}

/**
 * Creates and returns the initial gateway server state object.
 *
 * The returned state includes empty file paths, encryptions, and sessions, along with a `save` method that persists the state using the provided save function or a default database save function.
 *
 * @param saveFunction - Optional function to persist the state; defaults to saving to the database.
 * @returns The initialized gateway server state.
 */
export function createInitialState({
    saveFunction = saveStateToDatabase,
}: {
    saveFunction?: (state: State) => void;
}): State {
    return {
        filePaths: {},
        // sockets: {},
        encryptions: {},
        sessions: {},
        // queuedConnections: {},
        save: function (state?: State) {
            if (typeof state === 'undefined') {
                state = this as State;
            }
            if (typeof saveFunction === 'undefined') {
                saveStateToDatabase(state);
                return;
            }
            saveFunction(state);
        },
    };
}

/**
 * Returns a new state object with the given encryption added by connection ID.
 *
 * The original state is not modified.
 *
 * @returns The updated state including the new encryption.
 */
export function addEncryption(state: State, encryption: McosEncryption): State {
    const encryptions = state.encryptions;
    encryptions[encryption.connectionId] = encryption;
    return {
        ...state,
        encryptions,
    };
}

/**
 * Retrieves the encryption settings associated with a given connection ID from the state.
 *
 * @param connectionId - The unique identifier for the connection whose encryption is being retrieved.
 * @returns The {@link McosEncryption} for the specified connection ID, or undefined if not found.
 */
export function getEncryption(
    state: State,
    connectionId: string,
): McosEncryption | undefined {
    return state.encryptions[connectionId];
}

/**
 * Returns a new state object with the specified encryption updated by connection ID.
 *
 * The original state is not modified.
 *
 * @param encryption - The {@link McosEncryption} to update in the state, identified by its connection ID.
 * @returns A new {@link State} with the updated encryption.
 */
export function updateEncryption(
    state: State,
    encryption: McosEncryption,
): State {
    const encryptions = state.encryptions;
    encryptions[encryption.connectionId] = encryption;
    return {
        ...state,
        encryptions,
    };
}

/**
 * Returns a new state object with the encryption for the specified connection ID removed.
 *
 * @param connectionId - The connection ID whose encryption should be removed.
 * @returns The updated state without the specified encryption.
 */
export function removeEncryption(state: State, connectionId: string): State {
    const encryptions = state.encryptions;
    delete encryptions[connectionId];
    return {
        ...state,
        encryptions,
    };
}

/**
 * Returns a new state object with the given session added.
 *
 * The original state is not modified.
 *
 * @param session - The session to associate with its connection ID in the state.
 * @returns A new state object including the added session.
 */
export function addSession(state: State, session: McosSession): State {
    const sessions = state.sessions;
    sessions[session.connectionId] = session;
    return {
        ...state,
        sessions,
    };
}

/**
 * Removes a session from the state by its connection ID.
 *
 * Returns a new state object with the specified session removed. The original state is not modified.
 *
 * @param connectionId - The connection ID of the session to remove.
 * @returns The updated state without the specified session.
 */
export function removeSession(state: State, connectionId: string): State {
    const sessions = state.sessions;
    delete sessions[connectionId];
    return {
        ...state,
        sessions,
    };
}

/**
 * Retrieves the session associated with the specified connection ID.
 *
 * @param connectionId - The unique identifier for the connection.
 * @returns The {@link McosSession} for the given connection ID, or undefined if not found.
 */
export function findSessionByConnectionId(
    state: State,
    connectionId: string,
): McosSession | undefined {
    return state.sessions[connectionId];
}

/**
 * Retrieves the current gateway server state from in-memory storage.
 *
 * @returns The latest {@link State} object representing the server's state.
 */
export function fetchStateFromDatabase(): State {
    return globalStateDatabase;
}

/**
 * Persists the provided gateway server state in memory.
 *
 * Overwrites the current global state with the given {@link state}.
 */
function saveStateToDatabase(state: State) {
    globalStateDatabase = state;
}

let globalStateDatabase = createInitialState({});
