import { Room } from "./Room.js";
import { RoomServer } from "./RoomServer.js";

export class PrimaryRoomServer extends RoomServer {

    constructor(hostname: string, port: number) {
        super(0, 'RootServer', hostname, port);
    }


    initializeRoomServerList() {
        const roomServerIds = [
            '01',
            '02',
            '03',
            '04',
            '05',
            '06',
            '07',
            '08',
            '09',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
            '18',
            '19',
            '20',
        ];

        for (const roomId of roomServerIds) {
            const roomName = `MCC${roomId}`;
            this._roomList.set(roomName, new Room(roomName));
        }
    }
}
