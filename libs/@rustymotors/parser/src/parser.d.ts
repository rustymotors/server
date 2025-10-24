export type ParsedPacket = {
    readonly size: number,
    unpack<T extends ParsedPacket>(data: Buffer<ArrayBufferLike>): T,
    pack(): Buffer<ArrayBufferLike>
}