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

        for (let i = 0; i < roomServerIds.length; i++) {
            const roomId = roomServerIds[i]!;
            const riff = `MCC${roomId}`;
            const commId = i + 1;
            this._roomList.set(riff, new Room(commId, riff));
        }
    }
}
