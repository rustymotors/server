import { BytableChannelData } from "@rustymotors/binary";
import { User } from "./User.js";

export class Room {
    commId: number;
    riff: string;
    protocol: number;
    channelType: number;
    maxReadyPlayers: number;
    channelData: BytableChannelData;
    private _userList: Map<number, User> = new Map();

    constructor(commId: number, riff: string, protocol = 0, channelType = 0, maxReadyPlayers = 0) {
        this.commId = commId;
        this.riff = riff;
        this.protocol = protocol;
        this.channelType = channelType;
        this.maxReadyPlayers = maxReadyPlayers;
        this.channelData = new BytableChannelData();
    }

    get name() {
        return this.riff;
    }

    get userList(): Map<number, User> {
        return this._userList;
    }

    addUser(personaId: number, user: User) {
        this._userList.set(personaId, user);
    }

    removeUser(personaId: number) {
        this._userList.delete(personaId);
    }
}
