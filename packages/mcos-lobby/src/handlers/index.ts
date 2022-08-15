import type { Connection } from "@prisma/client";
import type { NPSMessage } from "../NPSMessage.js";
import { handleEncryptedNPSCommand } from "./encryptedCommand.js";
import { _npsHeartbeat } from "./heartbeat.js";
import { _npsRequestGameConnectServer } from "./requestConnectGameServer.js";

export interface MessageHandler {
    opCode: number;
    name: string;
    handlerFunction: (
        connection: Connection,
        data: Buffer
    ) => Promise<NPSMessage>;
}

export const handlerMap: MessageHandler[] = [
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
