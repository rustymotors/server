import { serverHeader } from "./messageFactory.js";

export interface ServerMessageType {
    _header: serverHeader;
    _msgNo: number;
    size(): number;
    _doDeserialize(buffer: Buffer): ServerMessageType;
    serialize(): Buffer;
    setBuffer(buffer: Buffer): void;
    updateMsgNo(): void;
    toString(): string;
    data: Buffer;
}

export type TServerLogger = {
    info: (message: string) => void;
    error: (message: string) => void;
    fatal: (message: string) => void;
    warn: (message: string) => void;
    debug: (message: string) => void;
    trace: (message: string) => void;
    setName: (name: string) => void;
};
