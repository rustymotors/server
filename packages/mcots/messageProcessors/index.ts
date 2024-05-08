import type { ServerMessage } from "../../shared-packets";
import { processClientConnect } from "./processClientConnect";
import { processClientTracking } from "./processClientTracking";
import { processServerLogin } from "./processServerLogin";
import { processStockCarInfo } from "./processStockCarInfo";

export type ServerSocketCallback = (messages: ServerMessage[]) => void;

export type ServerMessageProcessor = (
    connectionId: string,
    message: ServerMessage,
    socketCallback: ServerSocketCallback,
) => Promise<void>;

export const serverMessageProcessors = new Map<number, ServerMessageProcessor>([]);

export function populateServerMessageProcessors() {
    serverMessageProcessors.set(105, processServerLogin)
    serverMessageProcessors.set(141, processStockCarInfo)
    serverMessageProcessors.set(440, processClientTracking)
    serverMessageProcessors.set(438, processClientConnect)
};

export function getServerMessageProcessor(messageId: number) {
    return serverMessageProcessors.get(messageId);
}



