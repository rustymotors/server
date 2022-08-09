import type {
    BufferWithConnection,
    GSMessageArrayWithConnection,
} from "mcos-types/types.js";
import { handleEncryptedNPSCommand } from "./encryptedCommand.js";
import { _npsHeartbeat } from "./heartbeat.js";
import { _npsRequestGameConnectServer } from "./requestConnectGameServer.js";

export interface MessageHandler {
    opCode: number;
    name: string;
    handlerFunction: (
        arg0: BufferWithConnection
    ) => Promise<GSMessageArrayWithConnection>;
}

export const handlerMap: Array<MessageHandler> = [
    {
        opCode: 100,
        name: "Connect game server",
        handlerFunction: _npsRequestGameConnectServer,
    },
    { opCode: 217, name: "Heartbeat", handlerFunction: _npsHeartbeat },
    {
        opCode: 1101,
        name: "Encrypted command",
        handlerFunction: handleEncryptedNPSCommand,
    },
];
