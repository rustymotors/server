import { User } from "./User.js";

export class Room {
    _name: string;
    _userList: Map<number, User> = new Map();

    constructor(roomName: string) {
        this._name = roomName;
    }

    get name() {
        return this._name;
    }

    addUser(personaId: number, user: User) {
        this._userList.set(personaId, user);
    }
}
