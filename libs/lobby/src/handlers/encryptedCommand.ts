import {
    type TServerLogger,
    fetchStateFromDatabase,
    getEncryption,
    updateEncryption,
    LegacyMessage,
    MessageBuffer,
    SerializedBuffer,
} from "../../../shared";
import { handleSendMiniRiffList } from "./handleSendMiniRiffList.js";
import { handleGetMiniUserList } from "./handleGetMiniUserList.js";
import { _setMyUserData } from "./_setMyUserData.js";

/**
 * Array of supported command handlers
 *
 * @type {{
 *  opCode: number,
 * name: string,
 * handler: (args: {
 * connectionId: string,
 * message: SerializedBuffer,
 * log: ServerLogger,
 * }) => Promise<{
 * connectionId: string,
 * messages: SerializedBuffer[],
 * }>}[]}
 */
export const messageHandlers: {
    opCode: number;
    name: string;
    handler: (args: {
        connectionId: string;
        message: SerializedBuffer;
        log: TServerLogger;
    }) => Promise<{
        connectionId: string;
        messages: SerializedBuffer[];
    }>;
}[] = [];

/**
 * Takes an plaintext command packet and return the encrypted bytes
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage | MessageBuffer} args.message
 * @param {ServerLogger} args.log
 * @returns {Promise<{
 * connectionId: string,
 * message: LegacyMessage | MessageBuffer,
 * }>}
 */
async function encryptCmd({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: LegacyMessage | MessageBuffer;
    log: TServerLogger;
}): Promise<{
    connectionId: string;
    message: LegacyMessage | MessageBuffer;
}> {
    const state = fetchStateFromDatabase();

    const encryption = getEncryption(state, connectionId);

    if (typeof encryption === "undefined") {
        log.error(
            `Unable to locate encryption session for connection id ${connectionId}`,
        );
        throw new Error(
            `Unable to locate encryption session for connection id ${connectionId}`,
        );
    }

    const result = encryption.commandEncryption.encrypt(message.data);

    updateEncryption(state, encryption).save();

    log.debug(`[ciphered Cmd: ${result.toString("hex")}`);

    message.setBuffer(result);

    return {
        connectionId,
        message,
    };
}

/**
 * Takes an encrypted command packet and returns the decrypted bytes
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {ServerLogger} args.log
 * @returns {Promise<{
 *  connectionId: string,
 * message: LegacyMessage,
 * }>}
 */
async function decryptCmd({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: LegacyMessage;
    log: TServerLogger;
}): Promise<{
    connectionId: string;
    message: LegacyMessage;
}> {
    const state = fetchStateFromDatabase();

    const encryption = getEncryption(state, connectionId);

    if (typeof encryption === "undefined") {
        log.error(
            `Unable to locate encryption session for connection id ${connectionId}`,
        );
        throw new Error(
            `Unable to locate encryption session for connection id ${connectionId}`,
        );
    }

    const result = encryption.commandEncryption.decrypt(message.data);

    updateEncryption(state, encryption).save();

    log.debug(`[Deciphered Cmd: ${result.toString("hex")}`);

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
        log: TServerLogger;
    }) => Promise<{
        connectionId: string;
        message: LegacyMessage;
    }>;
};

const npsCommandHandlers: NpsCommandHandler[] = [
    {
        opCode: 0x128,
        name: "NPS_GET_MINI_USER_LIST",
        handler: handleGetMiniUserList,
    },
    {
        opCode: 0x30c,
        name: "NPS_SEND_MINI_RIFF_LIST",
        handler: handleSendMiniRiffList,
    },
    {
        opCode: 0x103,
        name: "NPS_SET_MY_USER_DATA",
        handler: _setMyUserData,
    },
];

/**
 *
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {ServerLogger} args.log
 * @return {Promise<{
 * connectionId: string,
 * message: MessageBuffer | LegacyMessage,
 * }>}}
 */
async function handleCommand({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: LegacyMessage;
    log: TServerLogger;
}): Promise<{
    connectionId: string;
    message: MessageBuffer | LegacyMessage;
}> {
    const incommingRequest = message;

    log.debug(
        `Received command: ${incommingRequest._doSerialize().toString("hex")}`,
    );

    // What is the command?
    const command = incommingRequest.data.readUInt16BE(0);

    log.debug(`Command: ${command}`);

    const handler = npsCommandHandlers.find((h) => h.opCode === command);

    if (typeof handler === "undefined") {
        log.error(`Unknown command: ${command}`);
        throw new Error(`Unknown command: ${command}`);
    }

    return handler.handler({
        connectionId,
        message,
        log,
    });
}

/**
 *
 *
 * @param {object} args
 * @param {string} args.connectionId
 * @param {SerializedBuffer} args.message
 * @param {ServerLogger} args.log
  * @returns {Promise<{
*  connectionId: string,
* messages: SerializedBuffer[],
* }>}

 */
export async function handleEncryptedNPSCommand({
    connectionId,
    message,
    log,
}: {
    connectionId: string;
    message: SerializedBuffer;
    log: TServerLogger;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}> {
    const inboundMessage = new LegacyMessage();
    inboundMessage._doDeserialize(message.data);

    // Decipher
    const decipheredMessage = decryptCmd({
        connectionId,
        message: inboundMessage,
        log,
    });

    const response = handleCommand({
        connectionId,
        message: (await decipheredMessage).message,
        log,
    });

    // Encipher
    const encryptedResponse = encryptCmd({
        connectionId,
        message: (await response).message,
        log,
    });

    const outboundMessage = new SerializedBuffer();
    outboundMessage.setBuffer((await encryptedResponse).message.serialize());

    return {
        connectionId,
        messages: [outboundMessage],
    };
}

export const channelRecordSize = 40;

export const channels = [
    {
        id: 0,
        name: "Channel 1",
        population: 1,
    },
    {
        id: 191,
        name: "MCCHAT",
        population: 0,
    },
];
