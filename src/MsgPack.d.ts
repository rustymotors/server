/// <reference types="node" />
export default class MsgPack {
    private sourcePacket;
    private opCode;
    private msgLength;
    constructor(packet: Buffer);
    /**
     * getOpCode
     */
    getOpCode(): number;
    /**
     * getMsgLength
     */
    getMsgLength(): number;
    private setOpCode;
    private setMsgLength;
}
