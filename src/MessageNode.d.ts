/// <reference types="node" />
import MsgHead from './MsgHead';
export default class MessageNode {
    toFrom: Buffer;
    appId: Buffer;
    rawBuffer: Buffer;
    seq: number;
    flags: number;
    header: MsgHead;
    buffer: Buffer;
    msgNo: number;
    constructor(packet: Buffer);
    setMsgNo(newMsgNo: number): void;
    setSeq(newSeq: number): void;
    setMsgHeader(packet: Buffer): void;
    setBuffer(packet: Buffer): void;
    BaseMsgHeader(packet: Buffer): void;
    getBaseMsgHeader(packet: Buffer): void;
    isMCOTS(): boolean;
    dumpPacket(): void;
}
