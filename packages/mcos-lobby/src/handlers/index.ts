import type { MessageHandler } from "../types.js";
import { handleEncryptedNPSCommand } from "./encryptedCommand.js";
import { _npsHeartbeat } from "./heartbeat.js";
import { _npsRequestGameConnectServer } from "./requestConnectGameServer.js";

export const  handlerMap: Array<MessageHandler> = [
  { opCode: 100, name: "Connect game server", handlerFunction: _npsRequestGameConnectServer},
  { opCode: 217, name: "Heartbeat", handlerFunction: _npsHeartbeat},
{ opCode: 1101, name: "Eccrypted command", handlerFunction: handleEncryptedNPSCommand}
]
