import { BytableChannelData } from "@rustymotors/binary";
import { User } from "./User.js";

export class Room {
    _name: string;
    _commId: number;
    _channelData: BytableChannelData = new BytableChannelData();
    _protocol: number = 0;
    _channelType: number = 0;
    _maxReadyPlayers: number = 0;
    _userList: Map<number, User> = new Map();

    constructor(commId: number, roomName: string) {
        this._commId = commId;
        this._name = roomName;
    }

    get name() {
        return this._name;
    }

    get commId() {
        return this._commId;
    }

    get riff() {
        return this._name;
    }

    get channelData() {
        return this._channelData;
    }

    get protocol() {
        return this._protocol;
    }

    get channelType() {
        return this._channelType;
    }

    get maxReadyPlayers() {
        return this._maxReadyPlayers;
    }

    addUser(personaId: number, user: User) {
        this._userList.set(personaId, user);
    }

    removeUser(personaId: number) {
        this._userList.delete(personaId);
    }

    get userList() {
        return this._userList;
    }
}

export function generateChatRooms() {
    const rooms: Room[] = [];
    for (let i = 1; i <= 20; i++) {
        const padded = String(i).padStart(2, '0');
        rooms.push(new Room(220 + i, `MCC${padded}`));
    }
    return rooms;
}

export function generateStaticRooms() {
    return [
        new Room(0, 'CTRL'),
        new Room(1, 'ROOM_LOBBY'),
        new Room(2, 'LOBBY'),
        new Room(191, 'MCCHAT'),
    ];
}
