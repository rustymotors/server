import type { NPSMessage, NPSHeader } from "rusty-motors-shared";

export function MockNPSMessage(): NPSMessage {
    return {
        data: Buffer.from("test-data"),
        _header: {
            _size: 0,
            id: 0,
            length: 0,
            version: 0,
            reserved: 0,
            checksum: 0,
            internalBuffer: Buffer.from("test-internal-buffer"),
            data: Buffer.from("test-data"),
            _doDeserialize: function (): NPSHeader {
                throw new Error("Function not implemented.");
            },
            _doSerialize: function (): Buffer {
                throw new Error("Function not implemented.");
            },
            setBuffer: function (): void {
                throw new Error("Function not implemented.");
            },
        },
        internalBuffer: Buffer.from("test-internal-buffer"),
        _doDeserialize: function (): NPSMessage {
            throw new Error("Function not implemented.");
        },
        serialize: function (): Buffer {
            throw new Error("Function not implemented.");
        },
        size: function (): number {
            throw new Error("Function not implemented.");
        },
        _doSerialize: function (): void {
            throw new Error("Function not implemented.");
        },
        setBuffer: function (): void {
            throw new Error("Function not implemented.");
        },
    };
}
