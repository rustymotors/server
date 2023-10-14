import { getServerLogger } from "../../../shared/log.js";
import {
    fetchStateFromDatabase,
    getEncryption,
    updateEncryption,
} from "../../../shared/State.js";
import { ServerError } from "../../../shared/errors/ServerError.js";
import {
    GameMessage,
    LegacyMessage,
    MessageBuffer,
    SerializedBuffer,
} from "../../../shared/messageFactory.js";
import { UserInfo } from "../UserInfoMessage.js";
import { getServerConfiguration } from "../../../shared/Configuration.js";
import { handleSendMiniRiffList } from "./handleSendMiniRiffList.js";
import { handleGetMiniUserList } from "./handleGetMiniUserList.js";
// eslint-disable-next-line no-unused-vars

/**
 * Array of supported command handlers
 *
 * @type {{
 *  opCode: number,
 * name: string,
 * handler: (args: {
 * connectionId: string,
 * message: SerializedBuffer,
 * log: import("pino").Logger,
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
        log: import("pino").Logger;
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
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 * @returns {Promise<{
 * connectionId: string,
 * message: LegacyMessage | MessageBuffer,
 * }>}
 */
async function encryptCmd({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}: {
    connectionId: string;
    message: LegacyMessage | MessageBuffer;
    log?: import("pino").Logger;
}): Promise<{
    connectionId: string;
    message: LegacyMessage | MessageBuffer;
}> {
    const state = fetchStateFromDatabase();

    const encryption = getEncryption(state, connectionId);

    if (typeof encryption === "undefined") {
        throw new ServerError(
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
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 * @returns {Promise<{
 *  connectionId: string,
 * message: LegacyMessage,
 * }>}
 */
async function decryptCmd({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: import("pino").Logger;
}): Promise<{
    connectionId: string;
    message: LegacyMessage;
}> {
    const state = fetchStateFromDatabase();

    const encryption = getEncryption(state, connectionId);

    if (typeof encryption === "undefined") {
        throw new ServerError(
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
        log: import("pino").Logger;
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
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 * @return {Promise<{
 * connectionId: string,
 * message: MessageBuffer | LegacyMessage,
 * }>}}
 */
async function handleCommand({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: import("pino").Logger;
}): Promise<{
    connectionId: string;
    message: MessageBuffer | LegacyMessage;
}> {
    log.level = getServerConfiguration({}).logLevel ?? "info";
    const incommingRequest = message;

    log.debug(
        `Received command: ${incommingRequest._doSerialize().toString("hex")}`,
    );

    // What is the command?
    const command = incommingRequest.data.readUInt16BE(0);

    log.debug(`Command: ${command}`);

    const handler = npsCommandHandlers.find((h) => h.opCode === command);

    if (typeof handler === "undefined") {
        throw new ServerError(`Unknown command: ${command}`);
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
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
  * @returns {Promise<{
*  connectionId: string,
* messages: SerializedBuffer[],
* }>}

 */
export async function handleEncryptedNPSCommand({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}: {
    connectionId: string;
    message: SerializedBuffer;
    log?: import("pino").Logger;
}): Promise<{
    connectionId: string;
    messages: SerializedBuffer[];
}> {
    log.level = getServerConfiguration({}).logLevel ?? "info";

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
];

export async function _setMyUserData({
    connectionId,
    message,
    log = getServerLogger({
        module: "Lobby",
    }),
}: {
    connectionId: string;
    message: LegacyMessage;
    log?: import("pino").Logger;
}) {
    log.level = getServerConfiguration({}).logLevel ?? "info";

    try {
        log.debug("Handling NPS_SET_MY_USER_DATA");
        log.debug(`Received command: ${message.serialize().toString("hex")}`);

        const incomingMessage = new UserInfo();
        incomingMessage.deserialize(message.serialize());

        log.debug(`User ID: ${incomingMessage._userId}`);

        // TODO: Here we should update the user's data in the database

        // Then we should send a response of the user's data

        // Build the packet
        const packetResult = new LegacyMessage();
        packetResult._header.id = 0x204;
        packetResult.deserialize(incomingMessage.serialize());

        log.debug(
            `Sending response: ${packetResult.serialize().toString("hex")}`,
        );

        return {
            connectionId,
            message: packetResult,
        };
    } catch (error) {
        throw ServerError.fromUnknown(
            error,
            "Error handling NPS_SET_MY_USER_DATA",
        );
    }
}
