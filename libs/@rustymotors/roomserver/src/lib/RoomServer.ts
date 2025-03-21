import { BytableMessage } from '@rustymotors/binary';
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
	SerializedBufferOld,
	ServiceResponse,
	type ServerLogger,
} from "rusty-motors-shared";
import { getMessageNumber, MessageNumberMap } from "./MessageNumberMap.js";
import { LoginRequest } from './LoginRequest.js';
import { UserData } from './UserData.js';

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
            default:{
                this.log.warn({ connectionId, messageName }, "Unknown message name");
                return {
                    connectionId,
                    messages: [],
                }
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