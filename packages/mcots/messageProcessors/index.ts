import type { ServerMessage } from "../../shared-packets";
import { processClientTracking } from "./processClientTracking";
import { processStockCarInfo } from "./processStockCarInfo";

export type ServerSocketCallback = (messages: ServerMessage[]) => void;

export type ServerMessageProcessor = (
    connectionId: string,
    message: ServerMessage,
    socketCallback: ServerSocketCallback,
) => Promise<void>;

export const serverMessageProcessors = new Map<number, ServerMessageProcessor>([]);

export function populateServerMessageProcessors() {
    serverMessageProcessors.set(141, processStockCarInfo)
    serverMessageProcessors.set(440, processClientTracking)
};

export function getServerMessageProcessor(messageId: number) {
    return serverMessageProcessors.get(messageId);
}



