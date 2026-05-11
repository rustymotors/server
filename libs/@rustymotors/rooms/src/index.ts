import { BytableChannelData } from "@rustymotors/binary";
import { PrimaryRoomServer } from "./lib/PrimaryRoomServer.js";
export { receiveRoomData } from "./receiveRoomData.js";
export * from "./types.js";

let _instance: PrimaryRoomServer | undefined;

export function getPrimaryRoomServer(host?: string, port?: number): PrimaryRoomServer {
    if (_instance) return _instance;

    const resolvedHost = host ?? process.env["PLS_HOST"];
    const resolvedPort = port ?? (process.env["PLS_PORT"] ? Number.parseInt(process.env["PLS_PORT"]) : undefined);

    if (typeof resolvedHost === "undefined") {
        throw new Error("getPrimaryRoomServer: PLS_HOST is required");
    }
    if (typeof resolvedPort === "undefined") {
        throw new Error("getPrimaryRoomServer: PLS_PORT is required");
    }

    _instance = new PrimaryRoomServer(resolvedHost, resolvedPort);
    return _instance;
}

export { BytableChannelData };

/**
 * riff is max 32 chars
 *
 * channelData is 256 bytes
 */
export type ChannelDef = {
    commId: number;
    riff: string;
    protocol: number;
    channelData: BytableChannelData;
    channelType: number;
    maxReadyPlayers: number;
};

export const roomList: Map<number, ChannelDef> = new Map();
