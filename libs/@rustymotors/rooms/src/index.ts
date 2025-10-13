import { PrimaryRoomServer } from "./lib/PrimaryRoomServer.js"
export * from "./types.js"

const PLS_HOST = process.env["PLS_HOST"]
const PLS_PORT = process.env['PLS_PORT']

if (typeof PLS_HOST === "undefined") {
    throw new Error('PLS_HOST is required')    
}
if (typeof PLS_PORT === "undefined") {
    throw new Error('PLS_PORT is required')
}

const primaryRoomServer = new PrimaryRoomServer(PLS_HOST, Number.parseInt(PLS_PORT))

export function getPrimaryRoomServer() {
    return primaryRoomServer
}

export type ChannelData = Buffer

/**
 * riff is max 32 chars
 * 
 * channelData is 256 bytes
 */
export type ChannelDef = {
    commId: number,
    riff: string,
    protocol: number,
    channelData: ChannelData,
    channelType: number,
    maxReadyPlayers: number
}

export const roomList: Map<number, ChannelDef> = new Map()

