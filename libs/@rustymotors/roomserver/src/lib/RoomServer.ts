import {
	BytableMessage,
	createRawMessage,
} from "@rustymotors/binary";
import { databaseManager } from "rusty-motors-database";
import {
	createCommandEncryptionPair,
	createDataEncryptionPair,
} from "rusty-motors-gateway";
import {
	addEncryption,
	fetchStateFromDatabase,
	getEncryption,
	getServerLogger,
	McosEncryption,
	ServiceResponse,
	updateEncryption,
	type ServerLogger,
} from "rusty-motors-shared";
import { getMessageNumber, MessageNumberMap } from "./MessageNumberMap.js";
import { LoginRequest } from './LoginRequest.js';
import { UserData } from './UserData.js';
import { handleGetMiniUserList } from "./handleGetMiniUserList.js";
import { handleSendMiniRiffList } from "./handleSendMiniRiffList.js";
import { _setMyUserData } from "./_setMyUserData.js";

export type NpsCommandHandler = {
	opCode: number;
	name: string;
	handler: (args: {
		connectionId: string;
		message: BytableMessage;
		log?: ServerLogger;
	}) => Promise<{
		connectionId: string;
		message: BytableMessage | null;
	}>;
};

const npsCommandHandlers: NpsCommandHandler[] = [
	{
		opCode: 0x128, // 296
		name: "NPS_GET_MINI_USER_LIST",
		handler: handleGetMiniUserList,
	},
	{
		opCode: 0x30c, // 780
		name: "NPS_SEND_MINI_RIFF_LIST",
		handler: handleSendMiniRiffList,
	},
	{
		opCode: 0x103, // 259
		name: "NPS_SET_MY_USER_DATA",
		handler: _setMyUserData,
	},
    {
        opCode: 0x106,
        name: "NPS_OPEN_COMM_CHANNEL",
        handler: _openCommChannel,
    }
];

async function handleCommand({
	connectionId,
	message,
	log = getServerLogger("lobby.handleCommand"),
}: {
	connectionId: string;
	message: BytableMessage;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	message: BytableMessage | null;
}> {
	log.debug({
        connectionId,
        command: message.serialize().toString("hex").slice(0, 4),
    }, 'Handling command');

	const command = message.header.messageId;

	// What is the command?
	log.debug({
        connectionId,
        command: MessageNumberMap[command],
    }, `Received command: ${MessageNumberMap[command]}(${command})`);

	const handler = npsCommandHandlers.find((h) => h.opCode === command);

	if (typeof handler === "undefined") {
		throw Error(`Unknown command: ${command}`);
	}

	const { message: response } = await handler.handler({
		connectionId,
		message,
        log: log.child({ connectionId, loggerName: handler.name }),
	});

	if (response !== null) {
		log.debug(
			`[${connectionId}] Sending response: ${response.serialize().toString("hex")}`,
		);
	}

	return {
		connectionId,
		message: response,
	};
}

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
async function encryptCmd({
	connectionId,
	message,
	log = getServerLogger("lobby.encryptCmd"),
}: {
	connectionId: string;
	message: BytableMessage;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	message: BytableMessage;
}> {
	log.debug(`[ciphering Cmd: ${message.serialize().toString("hex")}`);
	const state = fetchStateFromDatabase();

	const encryption = getEncryption(state, connectionId);

	if (typeof encryption === "undefined") {
		throw Error(
			`Unable to locate encryption session for connection id ${connectionId}`,
		);
	}

	let precriptedMessage = message.serialize();

	log.debug(`[precripted Cmd: ${precriptedMessage.toString("hex")}`);
	if (precriptedMessage.length % 8 !== 0) {
		const padding = Buffer.alloc(8 - (precriptedMessage.length % 8));
		precriptedMessage = Buffer.concat([precriptedMessage, padding]);
		log.debug(`[padded Cmd: ${precriptedMessage.toString("hex")}`);
	}

	const result = encryption.commandEncryption.encrypt(precriptedMessage);
	updateEncryption(state, encryption).save();

	log.debug(`[ciphered Cmd: ${result.toString("hex")}`);

	const encryptedMessage = createRawMessage();
	encryptedMessage.header.setMessageId(0x1101);
	encryptedMessage.setBody(result);

	log.debug(
		`[ciphered message: ${encryptedMessage.serialize().toString("hex")}`,
	);

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
 * @param {ServerLogger} [args.log=getServerLogger({ name: "Lobby" })]
 * @returns {Promise<{
 *  connectionId: string,
 * message: LegacyMessage,
 * }>}
 */
async function decryptCmd({
	connectionId,
	message,
	log = getServerLogger("lobby.decryptCmd"),
}: {
	connectionId: string;
	message: BytableMessage;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	message: BytableMessage;
}> {
	const state = fetchStateFromDatabase();

	const encryption = getEncryption(state, connectionId);

	if (typeof encryption === "undefined") {
		throw Error(
			`Unable to locate encryption session for connection id ${connectionId}`,
		);
	}

	const result = encryption.commandEncryption.decrypt(message.getBody());

	updateEncryption(state, encryption).save();

	log.debug(`[Deciphered Cmd: ${result.toString("hex")}`);

	const decipheredMessage = createRawMessage(result);

	return {
		connectionId,
		message: decipheredMessage,
	};
}

export async function handleEncryptedNPSCommand({
	connectionId,
	message,
	log = getServerLogger("lobby.handleEncryptedNPSCommand"),
}: {
	connectionId: string;
	message: BytableMessage;
	log?: ServerLogger;
}): Promise<{
	connectionId: string;
	messages: BytableMessage[];
}> {
	log.debug(`[${connectionId}] Handling encrypted NPS command`);
	log.debug(
		`[${connectionId}] Received command: ${message.serialize().toString("hex")}`,
	);

	// Decipher
	const decipheredMessage = await decryptCmd({
		connectionId,
		message,
		log: log.child({ connectionId, loggerName: "decryptCmd" }),
	});

	log.debug(
		`[${connectionId}] Deciphered message: ${decipheredMessage.message.serialize().toString("hex")}`,
	);

	const response = await handleCommand({
		connectionId,
		message: decipheredMessage.message,
		log: log.child({ connectionId, loggerName: "handleCommand" }),
	});

	if (response.message === null) {
		log.debug(`[${connectionId}] No response to send`);
		return {
			connectionId,
			messages: [],
		};
	}

	log.debug(
		`[${connectionId}] Sending response: ${response.message.serialize().toString("hex")}`,
	);

	// Encipher
	const result = await encryptCmd({
		connectionId,
		message: response.message,
		log: log.child({ connectionId, loggerName: "encryptCmd" }),
	});

	const encryptedResponse = result.message;

	log.debug(
		`[${connectionId}] Enciphered response: ${encryptedResponse.serialize().toString("hex")}`,
	);

	return {
		connectionId,
		messages: [encryptedResponse],
	};
}

export class RoomServer {
    private _id: number;
    private _name: string;
    private _ip: string;
    private _port: number;
    private log: ServerLogger;

    private usersData = new Map<number, UserData>();

    constructor({ id, name, ip, port }: { id: number, name: string, ip: string, port: number }) {
        this._name = name;
        this._id = id;
        this.log = getServerLogger(name, 'roomserver');
        this._ip = ip;
        this._port = port;        
    }

    async receivePacket({
        connectionId,
        packet,
    }: {
        connectionId: string;
        packet: BytableMessage;
    }): Promise<ServiceResponse> {
        this.log.debug({ connectionId, packet: packet.toHexString() }, "Received packet");

        const messageNumber = packet.header.messageId;
        const messageName = MessageNumberMap[messageNumber];

        if (!messageName) {
            this.log.warn({ connectionId, messageNumber }, "Unknown message number");
            return {
                connectionId,
                messages: [],
            }
        }

        this.log.debug({ connectionId, messageName }, "Handling message");

        switch (messageName) {
									case "NPS_LOGIN":
										return this.handleLogin({ connectionId, packet });
									case "NPS_ENCRYPTED_COMMAND":
										return handleEncryptedNPSCommand({
											connectionId,
											message: packet,
											log: this.log.child({
												connectionId,
												loggerName: "handleEncryptedNPSCommand",
											}),
										});
									default: {
										this.log.warn(
											{ connectionId, messageName },
											"Unknown message name",
										);
										return {
											connectionId,
											messages: [],
										};
									}
								}
    }
    private async handleLogin({ connectionId, packet }: { connectionId: string, packet: BytableMessage }): Promise<ServiceResponse> {
        const log = this.log.child({ connectionId, loggerName: "handlers/_npsRequestGameConnectServer" });

        try {
            log.debug({ connectionId, packet: packet.toHexString() }, "Handling NPS_LOGIN");

            const getServerInfoRequest = new LoginRequest();
            getServerInfoRequest.deserialize(packet.getBody());


            const customerId = getServerInfoRequest.customerNumber;
            const userId = getServerInfoRequest.userInfo.userId;

            log.debug(
                { connectionId, customerId: customerId , userId: userId },
                "Connecting to game server",
            );

            const state = fetchStateFromDatabase();

            const existingEncryption = getEncryption(
                state,
                connectionId,
            );

            if (!existingEncryption) {
                // Set the encryption keys on the lobby connection
                const keys =
                    await databaseManager.fetchSessionKeyByCustomerId(
                        customerId,
                    );

                if (keys === undefined) {
                    throw Error("Error fetching session keys!");
                }

                // We have the session keys, set them on the connection
                const newCommandEncryptionPair =
                    createCommandEncryptionPair(keys.sessionKey);

                const newDataEncryptionPair =
                    createDataEncryptionPair(keys.sessionKey);

                const newEncryption = new McosEncryption({
                    connectionId,
                    commandEncryptionPair: newCommandEncryptionPair,
                    dataEncryptionPair: newDataEncryptionPair,
                });

                addEncryption(state, newEncryption).save();
            }

            const userInfo = getServerInfoRequest.userInfo

            const userData = userInfo.userData;
            
            this.usersData.set(userId, userData);

            const response = new BytableMessage();
            response.header.setMessageId(
                getMessageNumber("NPS_LOGIN_RESPONSE"),
            );
            response.header.setMessageVersion(0);
            response.setSerializeOrder([
                { name: "userId", field: "Dword" },
                { name: "userName", field: "Container" },
                { name: "userData", field: "Buffer" },
            ]);

            response.setFieldValueByName("userId", userInfo.userId);
            response.setFieldValueByName("userName", userInfo.userName);
            response.setFieldValueByName("userData", Buffer.from(userData.get()));


            log.debug(
                { connectionId, response: response.toHexString() },
                "Sending NPS_LOGIN_RESPONSE",
            );

            return {
                connectionId,
                messages: [response],
            };


        } catch (error: any) {
            log.error({ connectionId, error  }, `Error handling NPS_LOGIN: ${(error as Error).message}`);
            return {
                connectionId,
                messages: [],
            };

        }
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get ip() {
        return this._ip;
    }

    get port() {
        return this._port;
    }
}

function _openCommChannel(args: { connectionId: string; message: BytableMessage; log?: Logger; }): Promise<{ connectionId: string; message: BytableMessage | null; }> {
    
}
