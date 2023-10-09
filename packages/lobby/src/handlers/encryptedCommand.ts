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
    serializeString,
} from "../../../shared/messageFactory.js";
import { UserInfo } from "../UserInfoMessage.js";
import { getServerConfiguration } from "../../../shared/Configuration.js";
import { handleSendMiniRiffList } from "./handleSendMiniRiffList.js";
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

export const channelRecordSize = 40;

export const channels = [
    {
        id: 0,
        name: "Channel 1",
        population: 1,
    },
];

// const userRecordSize = 100;
const user1 = new UserInfo();
user1._userId = 1;
user1._userName = "User 1";

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

    const responseMessage = new GameMessage(0x229);

    // const packetSize = 8 + 4 + 4 +4;
    const packetSize = 108;

    const numChannels = 1;

    const packetContent = Buffer.alloc(packetSize);

    let offset = 0;
    try {
        packetContent.writeUInt32BE(17, offset); // commId
        offset += 4; // offset is 8

        packetContent.writeUInt32BE(1, offset); // numUsers
        // offset += 4; // offset is 12

        // Add count of users
        packetContent.writeUInt32BE(1, offset);
        offset += 4; // offset is 16

        packetContent.writeUInt32BE(user1._userId, offset);
        offset += 4; // offset is 40

        offset = serializeString(user1._userName, packetContent, offset);
        // offset += 64; // offset is 104

        // Build the packet
        const gameMessage = MessageBuffer.createGameMessage(
            0x1101,
            packetContent,
        );
        const gameMessageBuffer = gameMessage.serialize();
        const legacyMessage = new LegacyMessage();
        legacyMessage._doDeserialize(gameMessageBuffer);

        log.debug(
            `Sending response: ${legacyMessage.serialize().toString("hex")}`,
        );

        return {
            connectionId,
            message: legacyMessage,
        };
    } catch (error) {
        throw ServerError.fromUnknown(
            error,
            "Error handling NPS_MINI_USER_LIST",
        );
    }
}
