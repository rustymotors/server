import type { ServerMessage } from "shared-packets";
import { processClientConnect } from "./processClientConnect.js";
import { processClientTracking } from "./processClientTracking.js";
import { processServerLogin } from "./processServerLogin.js";
import { processSetOptions } from "./processSetOptions.js";
import { processStockCarInfo } from "./processStockCarInfo.js";

export type ServerSocketCallback = (messages: ServerMessage[]) => void;

export type ServerMessageProcessor = (
  connectionId: string,
  message: ServerMessage,
  socketCallback: ServerSocketCallback
) => Promise<void>;

const serverMessageProcessors = new Map<number, ServerMessageProcessor>([]);

export function addServerMessageProcessor(
  messageId: number,
  processor: ServerMessageProcessor
) {
  serverMessageProcessors.set(messageId, processor);
}

export function populateServerMessageProcessors() {
  addServerMessageProcessor(105, processServerLogin);
  addServerMessageProcessor(109, processSetOptions);
  addServerMessageProcessor(141, processStockCarInfo);
  addServerMessageProcessor(440, processClientTracking);
  addServerMessageProcessor(438, processClientConnect);
}

export function getServerMessageProcessor(messageId: number) {
  return serverMessageProcessors.get(messageId);
}

export function getServerMessageProcessors() {
  return serverMessageProcessors;
}
