import type { Connection } from "@prisma/client";
import type { NPSMessage } from "../NPSMessage.js";

export interface MessageHandler {
    opCode: number;
    name: string;
    handlerFunction: (
        traceId: string,
        connection: Connection,
        data: Buffer
    ) => Promise<NPSMessage>;
}
