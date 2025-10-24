import {
    fetchStateFromDatabase,
    getEncryption,
    SerializedBufferOld,
    ServerLogger,
    updateEncryption,
} from 'rusty-motors-shared';
import { getServerLogger } from 'rusty-motors-shared';
import { BytableMessage, createRawMessage } from '@rustymotors/binary';
import { npsCommandHandlers } from './npsCommandHandlers.js';
import { Roarr as log, Logger } from 'roarr';

/**
 * Array of supported command handlers
 *
 * @type {{
 *  opCode: number,
 * name: string,
 * handler: (args: {
 * connectionId: string,
 * message: BytableMessage,
 * log: ServerLogger,
 * }) => Promise<{
 * connectionId: string,
 * messages: BytableMessage[],
 * }>}[]}
 */
export const messageHandlers: {
    opCode: number;
    name: string;
    handler: (args: {
        connectionId: string;
        message: BytableMessage;
        log: ServerLogger;
    }) => Promise<{
        connectionId: string;
        messages: BytableMessage[];
    }>;
}[] = [];

/**
 * Takes an plaintext command packet and return the encrypted bytes
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage | MessageBuffer} args.message
 * @param {ServerLogger} [args.log] Logger
 * @returns {Promise<{
 * connectionId: string,
 * message: LegacyMessage | MessageBuffer,
 * }>}
 */
export function encryptCmd({
    connectionId,
    message,
}: {
    connectionId: string;
    message: BytableMessage;
    logger?: ServerLogger;
}): {
    connectionId: string;
    message: BytableMessage;
} {
    const state = fetchStateFromDatabase();

    const encryption = getEncryption(state, connectionId);

    if (typeof encryption === 'undefined') {
        throw Error(
            `Unable to locate encryption session for connection id ${connectionId}`,
        );
    }

    let precriptedMessage = message.serialize();

    if (precriptedMessage.length % 8 !== 0) {
        const padding = Buffer.alloc(8 - (precriptedMessage.length % 8));
        precriptedMessage = Buffer.concat([precriptedMessage, padding]);
    }

    const result = encryption.commandEncryption.encrypt(precriptedMessage);
    updateEncryption(state, encryption).save();

    const encryptedMessage = createRawMessage();
    encryptedMessage.header.setMessageId(0x1101);
    encryptedMessage.setBody(result);

    return {
        connectionId,
        message: encryptedMessage,
    };
}

/**
 * Takes an encrypted command packet and returns the decrypted bytes
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @returns {Promise<{
 *  connectionId: string,
 * message: LegacyMessage,
 * }>}
 */
async function decryptCmd({
    connectionId,
    message,
}: {
    connectionId: string;
    message: BytableMessage;
}): Promise<{
    connectionId: string;
    message: BytableMessage;
}> {
    const state = fetchStateFromDatabase();

    const encryption = getEncryption(state, connectionId);

    if (typeof encryption === 'undefined') {
        throw Error(
            `Unable to locate encryption session for connection id ${connectionId}`,
        );
    }

    const result = encryption.commandEncryption.decrypt(message.getBody());

    updateEncryption(state, encryption).save();

    const decipheredMessage = createRawMessage(result);

    return {
        connectionId,
        message: decipheredMessage,
    };
}

export type NpsCommandHandler = {
    opCode: number;
    name: string;
    handler: (args: {
        connectionId: string;
        message: BytableMessage;
        log?: ServerLogger;
    }) => Promise<{
        connectionId: string;
        messages: BytableMessage[];
    }>;
};

async function handleCommand({
    connectionId,
    message,
    log: logger = getServerLogger('lobby.handleCommand'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: BytableMessage[];
}> {
        const command = message.header.messageId;

        // What is the command?
        logger.debug(`Received Command: ${command}`, {
            connectionId,
        });
        logger.debug(
            `Received Command message: ${message.serialize().toString('hex')}`,
            { connectionId },
        );

        const handler = npsCommandHandlers.find((h) => h.opCode === command);

        if (typeof handler === 'undefined') {
            throw Error(`Unknown command: ${command}`);
        }

        const { messages: responses } = await handler.handler({
            connectionId,
            message,
        });

        return {
            connectionId,
            messages: responses,
        };
}

/**
 *
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {BytableMessage} args.message
 * @param {ServerLogger} [args.log=getServerLogger({ name: "Lobby" })]
  * @returns {Promise<{
*  connectionId: string,
* messages: SerializedBufferOld[],
* }>}

 */
export async function handleEncryptedNPSCommand({
    connectionId,
    message,
    log: logger = getServerLogger('lobby.handleEncryptedNPSCommand'),
}: {
    connectionId: string;
    message: BytableMessage;
    log?: ServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBufferOld[];
}> {
    logger.debug(`Received encrypted command: ${message.header.messageId}`, {
        connectionId,
    });

    // Decipher
    const decipheredMessage = await decryptCmd({
        connectionId,
        message,
    });

    logger.debug(
        `Deciphered command: ${decipheredMessage.message.header.messageId}`,
        { connectionId },
    );

    const responses = await handleCommand({
        connectionId,
        message: decipheredMessage.message,
    });

    if (responses.messages === null) {
        logger.debug(`No response to send`, { connectionId });
        return {
            connectionId,
            messages: [],
        };
    }

    const encryptedMessages = responses.messages.map((message) => {
        try {
            const oldMsgId = message.header.messageId;

            // Encipher
            const result = encryptCmd({
                connectionId,
                message,
            });

            const encryptedResponse = result.message;
            const newMsgId = encryptedResponse.header.messageId;

            log.debug(
                {
                    oldMsgId,
                    newMsgId,
                    connectionId,
                },
                'Message encrypted',
            );

            const outPacket = new SerializedBufferOld();
            outPacket.deserialize(encryptedResponse.serialize());
            return outPacket;
        } catch (error) {
            const err = new Error(`Error encrypting response`);
            err.cause = error;
            throw err;
        }
    });

    return {
        connectionId,
        messages: encryptedMessages,
    };
}
