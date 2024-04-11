/// <reference types="node" />
export declare function put16(
    bytes: Buffer,
    offset: number,
    word: number,
    isLE: boolean,
): Buffer;
export declare function put8(
    bytes: Buffer,
    offset: number,
    byte: number,
): Buffer;
export declare function put16BE(
    bytes: Buffer,
    offset: number,
    word: number,
): Buffer;
export declare function put16LE(
    bytes: Buffer,
    offset: number,
    word: number,
): Buffer;
export declare function put32(
    bytes: Buffer,
    offset: number,
    word: number,
    isLE: boolean,
): Buffer;
export declare function put32BE(
    bytes: Buffer,
    offset: number,
    word: number,
): Buffer;
export declare function put32LE(
    bytes: Buffer,
    offset: number,
    word: number,
): Buffer;
export declare function putLenString(
    bytes: Buffer,
    offset: number,
    str: string,
    isLE: boolean,
): Buffer;
export declare function putLenBlob(
    bytes: Buffer,
    offset: number,
    blob: Buffer,
    isLE: boolean,
): Buffer;
export declare function putShortBool(
    bytes: Buffer,
    offset: number,
    bool: boolean,
): Buffer;
