/// <reference types="node" />
export declare class MessagePacket {
    _buffer: Buffer;
    /**
     *
     * @param {Buffer} buffer
     * @returns {MessagePacket}
     */
    static fromBuffer(buffer: Buffer): MessagePacket;
    /**
     * Will replace internal buffer without warning
     * @param {Buffer} buffer
     */
    setBuffer(buffer: Buffer): void;
    /**
     *
     * @returns {Buffer}
     */
    getBuffer(): Buffer;
}
//# sourceMappingURL=MessagePacket.d.ts.map