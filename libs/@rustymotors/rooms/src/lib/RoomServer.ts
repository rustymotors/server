import { ChatMessage } from "./ChatMessage.js";
import { Room } from "./Room.js";
import { User } from "./User.js";

export class RoomServer {
    _serverId;
    _serverName;
    _defaultRoomName = "LOBBY";
    _hostname: string
    _port: number
    _roomList: Map<string, Room> = new Map();
    _charList: Map<number, ChatMessage> = new Map();

    constructor(serverId: number, serverName: string, hostname: string, port: number) {
        this._serverId = serverId;
        this._serverName = serverName;
        this._hostname = hostname
        this._port = port
    }


    get roomList(): string[] {
        return Array.from(this._roomList.keys());
    }

    addUser(personaId: number) {
        const user = new User(personaId);
        const room = this._roomList.get(this._defaultRoomName);
        if (typeof room === "undefined") {
            throw new Error(`Error in Roomserver(${this._serverId})->addUser: Unable to locate room: ${this._defaultRoomName}!`);
        }
        room.addUser(personaId, user);
    }
}
