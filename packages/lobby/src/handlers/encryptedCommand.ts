import { getServerLogger } from "../../../shared/log.js";
import {
    fetchStateFromDatabase,
    getEncryption,
    updateEncryption,
} from "../../../shared/State.js";
import { ServerError } from "../../../shared/errors/ServerError.js";
import {
    LegacyMessage,
    MessageBuffer,
    SerializedBuffer,
    serializeString,
} from "../../../shared/messageFactory.js";
import { UserInfo } from "../UserInfoMessage.js";
import { getServerConfiguration } from "../../../shared/Configuration.js";
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

    switch (command) {
        case 0x128: // 296 - NPS_GET_MINI_USER_LIST
            log.debug("NPS_GET_MINI_USER_LIST");
            return handleGetMiniUserList({
                connectionId,
                message,
                log,
            });
        case 0x30c: // 780 - NPS_SEND_MINI_RIFF_LIST
            return handleSendMiniRiffList({
                connectionId,
                message,
                log,
            });
        default:
            throw new ServerError(`Unknown command: ${command}`);
    }
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

const channelRecordSize = 42;

const channels = [
    {
        id: 0,
        name: "Channel 1",
        population: 0,
    },
];

// const userRecordSize = 100;
const user1 = new UserInfo();
user1._userId = 1;
user1._userName = "User 1";

// const users = [user1];

/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 */
function handleSendMiniRiffList({
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

    log.debug("Handling NPS_SEND_MINI_RIFF_LIST");
    log.debug(`Received command: ${message._doSerialize().toString("hex")}`);

    const resultSize = 4 + channelRecordSize * channels.length;

    const packetContent = Buffer.alloc(resultSize + 6);

    try {
        // Add the response code
        packetContent.writeUInt16BE(0x404, 0);
        let offset = 2;
        packetContent.writeUInt16BE(resultSize, offset);
        offset += 2;

        packetContent.writeUInt16BE(channels.length, offset);
        offset += 2;

        // loop through the channels
        for (const channel of channels) {
            offset += serializeString(channel.name, packetContent, offset);

            packetContent.writeUInt16BE(channel.id, offset);
            offset += 2;
            packetContent.writeUInt16BE(channel.population, offset);
            offset += 2;
        }

        // Build the packet
        const packetResult = new LegacyMessage();
        packetResult._header.id = 0x1101;
        packetResult._header.length = resultSize;
        packetResult.setBuffer(packetContent);

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
            "Error handling NPS_SEND_MINI_RIFF_LIST",
        );
    }
}

/**
 * @param {object} args
 * @param {string} args.connectionId
 * @param {LegacyMessage} args.message
 * @param {import("pino").Logger} [args.log=getServerLogger({ module: "Lobby" })]
 */
function handleGetMiniUserList({
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

    log.debug("Handling NPS_GET_MINI_USER_LIST");
    log.debug(`Received command: ${message._doSerialize().toString("hex")}`);

    const packetContent = Buffer.alloc(12);

    try {
        // Add the response code
        packetContent.writeUInt16BE(0x0229, 0);

        let offset = 2; // offset is 2

        packetContent.writeUInt16BE(12, offset);
        offset += 2; // offset is 4

        packetContent.writeUInt32BE(17, offset);
        offset += 4; // offset is 8

        packetContent.writeUInt32BE(1, offset);

        // Build the packet
        const gameMessage = MessageBuffer.createGameMessage(
            0x1101,
            packetContent,
        );

        log.debug(
            `Sending response: ${gameMessage.serialize().toString("hex")}`,
        );

        return {
            connectionId,
            message: gameMessage,
        };
    } catch (error) {
        throw ServerError.fromUnknown(
            error,
            "Error handling NPS_MINI_USER_LIST",
        );
    }
}
