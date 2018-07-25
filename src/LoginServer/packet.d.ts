/// <reference types="node" />
export declare function buildPacket(len: number, header: number, content: Buffer): Buffer;
/**
 * This is the response packet sent on the login port in response to a UserLogin
 * TODO: Replace the need for this
 */
export declare function premadeLogin(): Buffer;
export declare function craftGenericReply(): Buffer;
export declare function premadePersonaMaps(): Buffer;
