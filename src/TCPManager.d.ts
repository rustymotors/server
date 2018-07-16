/// <reference types="node" />
import { Socket } from "net";
import { Connection } from "./Connection";
import { IRawPacket } from "./listenerThread";
import MessageNode from "./MessageNode";
/**
 * Return the string representation of the numeric opcode
 * @param {int} msgID
 */
export declare function MSG_STRING(msgID: number): "MC_CLIENT_CONNECT_MSG" | "Unknown";
export declare function ClientConnect(con: Connection, node: MessageNode): Promise<Connection>;
export declare function ProcessInput(node: MessageNode, conn: Connection): Promise<Connection>;
export declare function MessageReceived(msg: MessageNode, con: Connection): Promise<Connection>;
export declare function npsHeartbeat(): Promise<Buffer>;
export declare function lobbyDataHandler(rawPacket: IRawPacket): Promise<Connection>;
/**
 * Debug seems hard-coded to use the connection queue
 * Craft a packet that tells the client it's allowed to login
 */
export declare function sendPacketOkLogin(socket: Socket): void;
export declare function defaultHandler(rawPacket: IRawPacket): Promise<Connection>;
