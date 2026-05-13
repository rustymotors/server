import { ChatMessage } from "./ChatMessage.js";
import { Room, generateStaticRooms, generateChatRooms } from "./Room.js";
import { User } from "./User.js";

export class RoomServer {
    _serverId;
    _serverName;
    _defaultRoomName = "LOBBY";
    _hostname: string;
    _port: number;
    _roomList: Map<string, Room> = new Map();
    _charList: Map<number, ChatMessage> = new Map();

    constructor(
        serverId: number,
        serverName: string,
        hostname: string,
        port: number,
    ) {
        this._serverId = serverId;
        this._serverName = serverName;
        this._hostname = hostname;
        this._port = port;

        const staticRooms = generateStaticRooms();
        for (const room of staticRooms) {
            this._roomList.set(room.name, room);
        }

        const chatRooms = generateChatRooms();
        for (const room of chatRooms) {
            this._roomList.set(room.name, room);
        }   
    }

    get roomList(): string[] {
        return Array.from(this._roomList.keys());
    }

    getRoomByCommId(commId: number): Room {
        for (const room of this._roomList.values()) {
            if (room.commId === commId) {
                return room;
            }
        }

        console.dir({
            error: `Unable to locate room with commId: ${commId}!`,
            serverId: this._serverId,
            serverName: this._serverName,
            commId,
            availableRooms: Array.from(this._roomList.values()).map((room) => ({
                name: room.name,
                commId: room.commId,
            })),
        });

        throw new Error(`Error in RoomServer(${this._serverId})->getRoomByCommId: Unable to locate room with commId: ${commId}!`);
    }

    addUser(personaId: number) {
        const user = new User(personaId);
        const room = this._roomList.get(this._defaultRoomName);
        if (typeof room === "undefined") {
            throw new Error(
                `Error in Roomserver(${this._serverId})->addUser: Unable to locate room: ${this._defaultRoomName}!`,
            );
        }
        room.addUser(personaId, user);
    }
}
