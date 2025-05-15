import {
    fetchStateFromDatabase,
    getEncryption,
    updateEncryption,
} from 'rusty-motors-shared';
import { MessageBufferOld } from 'rusty-motors-shared';
import { SerializedBufferOld } from 'rusty-motors-shared';
import { LegacyMessage } from 'rusty-motors-shared';
import { _setMyUserData } from './_setMyUserData.js';
import { handleGetMiniUserList } from './handleGetMiniUserList.js';
import { handleSendMiniRiffList } from './handleSendMiniRiffList.js';
import { getServerLogger, ServerLogger } from 'rusty-motors-logger';

/**
 * Array of supported command handlers
 *
 * @type {{
 *  opCode: number,
 * name: string,
 * handler: (args: {
 * connectionId: string,
 * message: SerializedBufferOld,
 * log: ServerLogger,
 * }) => Promise<{
 * connectionId: string,
 * messages: SerializedBufferOld[],
 * }>}[]}
 */
export const messageHandlers: {
    opCode: number;
    name: string;
    handler: (args: {
        connectionId: string;
        message: SerializedBufferOld;
        log: ServerLogger;
    }) => Promise<{
        connectionId: string;
        messages: SerializedBufferOld[];
    }>;
}[] = [];

/**
 * Encrypts a plaintext command message for a specific connection.
 *
 * Retrieves the encryption session for the given {@link connectionId}, encrypts the message data, updates the session state, and returns the encrypted message.
 *
 * @param connectionId - The identifier for the connection whose encryption session is used.
 * @param message - The plaintext command message to encrypt.
 * @returns An object containing the {@link connectionId} and the encrypted {@link message}.
 *
 * @throws {Error} If no encryption session is found for the specified {@link connectionId}.
 */
async function encryptCmd({
    connectionId,
    message,
    log = getServerLogger('lobby.encryptCmd'),
}: {
    connectionId: string;
    message: LegacyMessage | MessageBufferOld;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    message: LegacyMessage | MessageBufferOld;
}> {
    const state = fetchStateFromDatabase();

    const encryption = getEncryption(state, connectionId);

    if (typeof encryption === 'undefined') {
        throw Error(
            `Unable to locate encryption session for connection id ${connectionId}`,
        );
    }

    const result = encryption.commandEncryption.encrypt(message.data);

    updateEncryption(state, encryption).save();

    log.debug(`[ciphered Cmd: ${result.toString('hex')}`);

    message.setBuffer(result);

    return {
        connectionId,
        message,
    };
}

/**
 * Decrypts an encrypted command message for a given connection.
 *
 * Retrieves the encryption session for the specified {@link connectionId}, decrypts the provided {@link message}, updates the session state, and returns the decrypted message.
 *
 * @param connectionId - The identifier for the connection whose encryption session is used.
 * @param message - The encrypted command message to decrypt.
 * @returns An object containing the {@link connectionId} and the decrypted {@link message}.
 *
 * @throws {Error} If no encryption session is found for the given {@link connectionId}.
 */
async function decryptCmd({
    connectionId,
    message,
    log = getServerLogger('lobby.decryptCmd'),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    message: LegacyMessage;
}> {
    const state = fetchStateFromDatabase();

    const encryption = getEncryption(state, connectionId);

    if (typeof encryption === 'undefined') {
        throw Error(
            `Unable to locate encryption session for connection id ${connectionId}`,
        );
    }

    const result = encryption.commandEncryption.decrypt(message.data);

    updateEncryption(state, encryption).save();

    log.debug(`[Deciphered Cmd: ${result.toString('hex')}`);

    message.setBuffer(result);

    return {
        connectionId,
        message,
    };
}

export type NpsCommandHandler = {
    opCode: number;
    name: string;
    handler: (args: {
        connectionId: string;
        message: LegacyMessage;
        log: ServerLogger;
    }) => Promise<{
        connectionId: string;
        message: LegacyMessage | null;
    }>;
};

const npsCommandHandlers: NpsCommandHandler[] = [
    {
        opCode: 0x128,
        name: 'NPS_GET_MINI_USER_LIST',
        handler: handleGetMiniUserList,
    },
    {
        opCode: 0x30c,
        name: 'NPS_SEND_MINI_RIFF_LIST',
        handler: handleSendMiniRiffList,
    },
    {
        opCode: 0x103,
        name: 'NPS_SET_MY_USER_DATA',
        handler: _setMyUserData,
    },
];

/**
 * Dispatches a decrypted NPS command message to the appropriate handler based on its opcode.
 *
 * @param connectionId - The identifier for the client connection.
 * @param message - The decrypted command message to process.
 * @param log - Optional logger instance.
 * @returns An object containing the {@link connectionId} and the handler's response message, or {@code null} if no response is needed.
 *
 * @throws {Error} If the command opcode is not recognized.
 */
async function handleCommand({
    connectionId,
    message,
    log = getServerLogger('lobby.handleCommand'),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    message: MessageBufferOld | LegacyMessage | null;
}> {
    const incommingRequest = message;

    log.debug(
        `[${connectionId}] Received command: ${incommingRequest._doSerialize().toString('hex')}`,
    );

    // What is the command?
    const command = incommingRequest.data.readUInt16BE(0);

    log.debug(`Command: ${command}`);

    const handler = npsCommandHandlers.find((h) => h.opCode === command);

    if (typeof handler === 'undefined') {
        throw Error(`Unknown command: ${command}`);
    }

    return handler.handler({
        connectionId,
        message,
        log,
    });
}

/**
 * Processes an incoming encrypted NPS command, decrypts it, dispatches it to the appropriate handler, and returns an encrypted response.
 *
 * Decrypts the provided message, invokes the corresponding command handler, and encrypts the response. If the handler returns no response, an empty array is returned.
 *
 * @returns An object containing the {@link connectionId} and an array of encrypted response messages. If no response is generated, the messages array will be empty.
 */
export async function handleEncryptedNPSCommand({
    connectionId,
    message,
    log = getServerLogger('lobby.handleEncryptedNPSCommand'),
}: {
    connectionId: string;
    message: SerializedBufferOld;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBufferOld[];
}> {
    const inboundMessage = new LegacyMessage();
    inboundMessage._doDeserialize(message.data);

    // Decipher
    const decipheredMessage = await decryptCmd({
        connectionId,
        message: inboundMessage,
        log,
    });

    const response = await handleCommand({
        connectionId,
        message: decipheredMessage.message,
        log,
    });

    if (response.message === null) {
        log.debug(`[${connectionId}] No response to send`);
        return {
            connectionId,
            messages: [],
        };
    }

    // Encipher
    const encryptedResponse = encryptCmd({
        connectionId,
        message: response.message,
        log,
    });

    const outboundMessage = new SerializedBufferOld();
    outboundMessage.setBuffer((await encryptedResponse).message.serialize());

    return {
        connectionId,
        messages: [outboundMessage],
    };
}
