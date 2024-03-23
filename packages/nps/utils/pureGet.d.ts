/// <reference types="node" />
export declare function getWord(
    bytes: Buffer,
    offset: number,
    isLE: boolean,
): number;
export declare function getDWord(
    bytes: Buffer,
    offset: number,
    isLE: boolean,
): number;
/**
 * Get the first n bytes of a buffer.
 * If the buffer is shorter than n bytes, return the whole buffer
 */
export declare function getNBytes(bytes: Buffer, n: number): Buffer;
export declare function getAsHex(bytes: Buffer): string;
export declare function getLenString(
    bytes: Buffer,
    offset: number,
    isLE: boolean,
): string;
export declare function getLenBlob(
    bytes: Buffer,
    offset: number,
    isLE: boolean,
): Buffer;
export declare function getShortBool(bytes: Buffer, offset: number): boolean;
