
export function detectPacketLength(buffer: Buffer): number {
    // The packet length includes the 4 bytes header

    return buffer.readUInt16BE(2);
}export function detectPacketStartIndex(buffer: Buffer, packetStartBytes: string): number {
    const packetStartSignature = Buffer.from(packetStartBytes, "hex");

    for (let i = 0; i <= buffer.length - packetStartSignature.length; i++) {
        let match = true;
        for (let j = 0; j < packetStartSignature.length; j++) {
            if (buffer[i + j] !== packetStartSignature[j]) {
                match = false;
                break;
            }
        }
        if (match) {
            return i;
        }
    }
    return -1; // Signature not found
}
export function extractPacketBuffer(testBuffer1: Buffer<ArrayBuffer>) {
    const packetLength = detectPacketLength(testBuffer1);
    if (!ensureEnoughRemainingBytes(testBuffer1, packetLength)) {
        throw new Error(`Not enough remaining bytes for a full packet: expected ${packetLength}, got ${testBuffer1.length}`);
    }
    const packetBuffer = testBuffer1.subarray(0, packetLength);
    return packetBuffer;
}
export function ensureEnoughRemainingBytes(remainingBytesBuffer: Buffer<ArrayBufferLike>, packetLength: number): boolean {
    if (remainingBytesBuffer.length < packetLength)
        return false;

    return true;
}
export function popPacketFromBuffer(dataBuffer: Buffer<ArrayBufferLike>): {
    packet: Buffer;
    remainingBuffer: any;
} {
    const packetLength = detectPacketLength(dataBuffer);
    if (!ensureEnoughRemainingBytes(dataBuffer, packetLength)) {
        throw new Error(
            `Not enough remaining bytes for a full packet: expected ${packetLength}, got ${dataBuffer.length}`
        );
    }
    return {
        packet: dataBuffer.subarray(0, packetLength),
        remainingBuffer: dataBuffer.subarray(packetLength),
    };
}

