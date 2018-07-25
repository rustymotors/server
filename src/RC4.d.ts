/// <reference types="node" />
export declare class RC4 {
    private mState;
    private mX;
    private mY;
    private keyBytes;
    private keyLen;
    constructor(key: any);
    getKey(): any;
    getKeyLen(): any;
    getSBox(): any;
    processString(inString: any): Buffer;
    private swapByte;
}
