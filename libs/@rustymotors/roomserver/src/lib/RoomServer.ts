import { BytableMessage } from '@rustymotors/binary';
import { getServerLogger, ServiceResponse, type ServerLogger } from 'rusty-motors-shared';
import { MessageNumberMap } from './MessageNumberMap.js';
import { LoginRequest } from './LoginRequest.js';

export class RoomServer {
    private _id: number;
    private _name: string;
    private _ip: string;
    private _port: number;
    private log: ServerLogger;

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
        const log = getServerLogger("RoomServer.handleLogin");

        try {
            log.debug({ connectionId, packet: packet.toHexString() }, "Handling NPS_LOGIN");

            const getServerInfoRequest = new LoginRequest();
            getServerInfoRequest.deserialize(packet.getBody());

            log.debug({ connectionId, getServerInfoRequest }, "Received NPS_LOGIN");

        } catch (error) {
            log.error({ connectionId, error }, `Error handling NPS_LOGIN: ${error.message}`);
            return {
                connectionId,
                messages: [],
            };

        }
        return {
            connectionId,
            messages: [],
        };
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