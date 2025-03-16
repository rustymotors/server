import { BytableMessage } from '@rustymotors/binary';
import { getServerLogger, ServiceResponse, type ServerLogger } from 'rusty-motors-shared';

export class Room {}

export class RoomServer {
    private _id: number;
    private _name: string;
    private _ip: string;
    private _port: number;
    private _rooms: Map<string, Room>;
    private log: ServerLogger;

    constructor({id, name, ip, port}: {id: number, name: string, ip: string, port: number}) {
        this._name = name;
        this._id = id;
        this.log = getServerLogger(name);
        this._ip = ip;
        this._port = port;
        this._rooms = new Map<string, Room>();
    }

    async recievePacket({
        connectionId,
        packet,
    }: {
        connectionId: string;
        packet: BytableMessage;
    }): Promise<ServiceResponse> {
        this.log.debug({connectionId, packet: packet.toHexString()}, "Received packet");

        return {
            connectionId,
            messages: [],
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