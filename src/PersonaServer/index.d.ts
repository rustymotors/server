import { IRawPacket } from "../listenerThread"
/**
 * Route an incoming persona packet to the connect handler
 * TODO: See if this can be handled by a MessageNode
 * @param {Socket} socket
 * @param {Buffer} rawData
 */
export declare function personaDataHandler(rawPacket: IRawPacket): Promise<import("../../src/Connection").Connection>;
