import { Room } from "./Room.js";
import { RoomServer } from "./RoomServer.js";

export class PrimaryRoomServer extends RoomServer {

    constructor(hostname: string, port: number) {
        super(0, 'RootServer', hostname, port);
        this.initializeRoomServerList();
    }

    initializeRoomServerList() {
        this._roomList.clear();

        this._roomList.set('CTRL', new Room(0, 'CTRL'));
        this._roomList.set('LOBBY', new Room(2, 'LOBBY'));
        this._roomList.set('MCCHAT', new Room(191, 'MCCHAT'));

        for (let i = 1; i <= 20; i++) {
            const padded = String(i).padStart(2, '0');
            const riff = `MCC${padded}`;
            const commId = 220 + i; // MCC01=221 ... MCC20=240
            this._roomList.set(riff, new Room(commId, riff));
        }
    }
}
