import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MessageNode } from "rusty-motors-shared";
import { receiveTransactionsData } from "./internal.js";
import { getTransactionsHandlerRegistry } from "./handlers/registry.js";
import { explode } from "pklib-ts";

vi.mock("pklib-ts", () => ({
    explode: vi.fn(),
}));

// Keep the real shared package (MessageNode, OldServerMessage, ...) so the parse and
// serialize paths in internal.ts actually run. Only logging, state and encryption are faked.
vi.mock("rusty-motors-shared", async (importOriginal) => {
    const actual = await importOriginal<typeof import("rusty-motors-shared")>();
    const logger = {
        debug: vi.fn(),
        verbose: vi.fn(),
        error: vi.fn(),
    };
    return {
        ...actual,
        getServerLogger: vi.fn(() => logger),
        fetchStateFromDatabase: vi.fn(() => ({})),
        getEncryption: vi.fn(() => ({
            dataEncryption: {
                decrypt: (buf: Buffer) => {
                    // simple transformation for tests: flip bytes
                    const out = Buffer.from(buf);
                    for (let i = 0; i < out.length; i++) out[i] = out[i]! ^ 0xff;
                    return out;
                },
            },
        })),
        updateEncryption: vi.fn(() => ({ save: vi.fn() })),
    };
});

// Mock handlers module used by internal.ts for _MSG_STRING
vi.mock("./handlers.js", () => {
    return {
        _MSG_STRING: (_: number) => "TESTMSG",
    };
});

// Mock the handler registry used by internal.ts so processInput finds a handler
vi.mock("./handlers/registry.js", () => {
    const mockHandler = vi.fn(async () => {
        // return no outbound messages to keep tests focused on inbound behavior
        return { messages: [] };
    });
    const mockRegistry = {
        getHandler: vi.fn((opCode: number) => {
            if (opCode === 1) {
                return {
                    opCode: 1,
                    name: "TESTMSG",
                    handler: mockHandler,
                };
            }
            return undefined;
        }),
    };
    return {
        getTransactionsHandlerRegistry: vi.fn(() => mockRegistry),
    };
});

const FLAG_COMPRESSED = 0x02;
const FLAG_ENCRYPTED = 0x08;

// Build a real MessageNode: opcode (2 bytes LE) followed by the payload bytes
function makeMessage({
    opcode = 1,
    payload = Buffer.alloc(0),
    sequence = 1,
    encrypted = false,
    compressed = false,
}: {
    opcode?: number;
    payload?: Buffer;
    sequence?: number;
    encrypted?: boolean;
    compressed?: boolean;
} = {}) {
    const message = new MessageNode();
    const opcodeBytes = Buffer.alloc(2);
    opcodeBytes.writeInt16LE(opcode);
    message.setDataBuffer(Buffer.concat([opcodeBytes, payload]));
    message.setSequence(sequence);
    message.setPayloadEncryption(encrypted);
    message.setPayloadCompression(compressed);
    return message;
}

// The full packet as it appears on the wire, built byte by byte (not via serialize())
// so the assertions below are independent of the code under test:
// length (2, LE: 9 + body) | "TOMC" | sequence (4, LE) | flags (1) | body
function expectedPacket({
    sequence,
    flags,
    body,
}: {
    sequence: number;
    flags: number;
    body: Buffer;
}) {
    const header = Buffer.alloc(11);
    header.writeUInt16LE(9 + body.length, 0);
    header.write("TOMC", 2, "utf8");
    header.writeInt32LE(sequence, 6);
    header.writeInt8(flags, 10);
    return Buffer.concat([header, body]);
}

// The handler the registry mock hands out for opcode 1
function getMockHandler() {
    return getTransactionsHandlerRegistry().getHandler(1)!.handler as unknown as Mock;
}

// The packet the handler received on its first call
function getHandlerPacket() {
    return getMockHandler().mock.calls[0]![0].packet;
}

// Reset mocks between tests for clearer assertions
beforeEach(() => {
    vi.clearAllMocks();
});

describe("decryptedMessage (via receiveTransactionsData)", () => {
    it("should decrypt inbound message body and clear payload encryption flag", async () => {
        const plain = Buffer.from([0x01, 0x00, 0x11, 0x22]);
        // the mocked cipher flips every byte, so the wire form is the inverse
        const wire = Buffer.from(plain.map((b) => b ^ 0xff));

        const inboundMessage = new MessageNode();
        inboundMessage.setDataBuffer(wire);
        inboundMessage.setSequence(7);
        inboundMessage.setPayloadEncryption(true);

        // spy on the real body, after setup, so only the decrypt step is counted
        const deserializeSpy = vi.spyOn(inboundMessage.getBody(), "deserialize");

        const result = await receiveTransactionsData({
            connectionId: "conn-1",
            message: inboundMessage,
        });

        // handler returns no outbound messages, so messages array should be empty
        expect(result.connectionId).toEqual("conn-1");
        expect(result.messages).toHaveLength(0);

        // body.deserialize should have been called with the decrypted data (xor 0xff transformation)
        expect(deserializeSpy).toHaveBeenCalledTimes(1);
        const calledWith = deserializeSpy.mock.calls[0]![0] as Buffer;
        expect(calledWith).toBeInstanceOf(Buffer);
        expect(calledWith).toEqual(plain);

        // the body now holds the decrypted bytes and the encryption flag is cleared
        expect(inboundMessage.data).toEqual(plain);
        expect(inboundMessage.flags & FLAG_ENCRYPTED).toBe(0);

        // the handler saw the decrypted payload, not the wire bytes
        expect(getMockHandler()).toHaveBeenCalledTimes(1);
        expect(getHandlerPacket().data).toEqual(plain);

        // and the whole packet, header included, is exactly right: sequence kept, flags cleared
        const expected = expectedPacket({ sequence: 7, flags: 0, body: plain });
        expect(inboundMessage.serialize()).toEqual(expected);
        expect(getHandlerPacket().serialize()).toEqual(expected);
    });

    it("hands the handler the inbound sequence number and data", async () => {
        const message = makeMessage({
            opcode: 1,
            payload: Buffer.from([0xde, 0xad, 0xbe, 0xef]),
            sequence: 42,
        });

        await receiveTransactionsData({ connectionId: "conn-seq", message });

        expect(getMockHandler()).toHaveBeenCalledTimes(1);
        const args = getMockHandler().mock.calls[0]![0];
        expect(args.connectionId).toEqual("conn-seq");
        expect(args.packet.sequenceNumber).toBe(42);
        expect(args.packet.data).toEqual(message.data);

        // byte-for-byte: the handler's packet is the same whole packet that came in
        const expected = expectedPacket({
            sequence: 42,
            flags: 0,
            body: Buffer.from([0x01, 0x00, 0xde, 0xad, 0xbe, 0xef]),
        });
        expect(message.serialize()).toEqual(expected);
        expect(args.packet.serialize()).toEqual(expected);
    });

    it("accepts a MessageNode subclass the same as a MessageNode", async () => {
        class TaggedMessageNode extends MessageNode {}

        const message = new TaggedMessageNode();
        message.setDataBuffer(Buffer.from([0x01, 0x00, 0xaa]));
        message.setSequence(3);

        const result = await receiveTransactionsData({
            connectionId: "conn-2",
            message,
        });

        expect(result.connectionId).toEqual("conn-2");
        expect(result.messages).toHaveLength(0);
        expect(getHandlerPacket().sequenceNumber).toBe(3);
    });

    it("does not let a handler mutate the inbound message", async () => {
        const original = Buffer.from([0x01, 0x00, 0xca, 0xfe]);
        const message = makeMessage({ opcode: 1, payload: original.subarray(2), sequence: 9 });

        getMockHandler().mockImplementationOnce(async ({ packet }: { packet: MessageNode }) => {
            // a handler is free to rewrite the packet it was given
            packet.setSequence(999);
            packet.setDataBuffer(Buffer.from([0x01, 0x00, 0x00, 0x00]));
            return { messages: [] };
        });

        await receiveTransactionsData({ connectionId: "conn-iso", message });

        expect(message.sequence).toBe(9);
        expect(message.data).toEqual(original);
    });
});

describe("decompressMessage path (via receiveTransactionsData)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("does not throw 'subarray is not a function' for a compressed MessageNode", async () => {
        // Regression: MessageNode.getDataBuffer() returns MessageNodeBody (not Buffer),
        // so calling .subarray on it would throw. The fix uses .data instead.
        (explode as Mock).mockImplementation((_readCb: any, writeCb: any) => {
            writeCb(new Uint8Array([0x01, 0x00]), 2);
            return { success: true };
        });

        const message = makeMessage({
            payload: Buffer.from([0xab, 0xcd]),
            compressed: true,
        });

        await expect(
            receiveTransactionsData({ connectionId: "conn-decomp-1", message }),
        ).resolves.toBeDefined();
    });

    it("clears the compression flag after successful decompression", async () => {
        (explode as Mock).mockImplementation((_readCb: any, writeCb: any) => {
            writeCb(new Uint8Array([0x01, 0x00]), 2);
            return { success: true };
        });

        const message = makeMessage({
            payload: Buffer.from([0xab, 0xcd]),
            compressed: true,
        });
        expect(message.isPayloadCompressed()).toBe(true);

        await receiveTransactionsData({ connectionId: "conn-decomp-2", message });

        expect(message.flags & FLAG_COMPRESSED).toBe(0);
    });

    it("passes bytes after the 2-byte opcode to explode, not the full body", async () => {
        const compressedPayload = Buffer.from([0xde, 0xad, 0xbe, 0xef]);
        let capturedReadCb: any;

        (explode as Mock).mockImplementation((readCb: any, writeCb: any) => {
            capturedReadCb = readCb;
            writeCb(new Uint8Array([0x01, 0x00]), 2);
            return { success: true };
        });

        const message = makeMessage({ payload: compressedPayload, compressed: true });
        await receiveTransactionsData({ connectionId: "conn-decomp-3", message });

        // Drain the read callback to verify it reads from offset 2 (past the opcode)
        const readBuf = new Uint8Array(4);
        const n = capturedReadCb(readBuf, 4);
        expect(n).toBe(4);
        expect(Buffer.from(readBuf.subarray(0, n))).toEqual(compressedPayload);
    });

    it("replaces body with decompressed data", async () => {
        const decompressedPayload = new Uint8Array([0x01, 0x00, 0x42, 0x43, 0x44]);

        (explode as Mock).mockImplementation((_readCb: any, writeCb: any) => {
            writeCb(decompressedPayload, decompressedPayload.length);
            return { success: true };
        });

        const message = makeMessage({
            payload: Buffer.from([0xab, 0xcd]),
            compressed: true,
        });
        await receiveTransactionsData({ connectionId: "conn-decomp-4", message });

        expect(message.data).toEqual(Buffer.from(decompressedPayload));
        expect(getHandlerPacket().data).toEqual(Buffer.from(decompressedPayload));

        // whole packet: compression flag cleared, sequence and signature untouched
        const expected = expectedPacket({
            sequence: 1,
            flags: 0,
            body: Buffer.from(decompressedPayload),
        });
        expect(message.serialize()).toEqual(expected);
        expect(getHandlerPacket().serialize()).toEqual(expected);
    });
});
