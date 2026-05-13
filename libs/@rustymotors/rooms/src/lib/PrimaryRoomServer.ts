import { RoomServer } from "./RoomServer.js";

export class PrimaryRoomServer extends RoomServer {
    constructor(hostname: string, port: number) {
        super(0, "RootServer", hostname, port);
    }
}
