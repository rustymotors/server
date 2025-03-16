
export interface PacketBody {
    serialize(): Uint8Array;
    deserialize(data: Uint8Array): void;
    size(): number;
}
