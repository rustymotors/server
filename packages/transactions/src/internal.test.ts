import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { receiveTransactionsData } from "./internal.js";

// Mocks for external modules used by internal.ts
vi.mock("rusty-motors-shared", () => {
    const logger = {
        debug: vi.fn(),
        verbose: vi.fn(),
        error: vi.fn(),
    };
    return {
        getServerLogger: vi.fn(() => logger),
        // types/classes that may be imported but are unused in tests
        MessageNode: class {},
        ServerLogger: class {},
        McosEncryption: class {},
        // SerializedBufferOld removed - use BytableBuffer instead
        State: class {},
        OldServerMessage: class {
            _doDeserialize(_: Buffer) { /* noop */ }
        },
        // state/encryption related functions that internal.ts calls
        fetchStateFromDatabase: vi.fn(() => ({})),
        getEncryption: vi.fn(() => ({
            dataEncryption: {
                decrypt: (buf: Buffer) => {
                    // simple transformation for tests: flip bytes
                    const out = Buffer.from(buf);
                    for (let i = 0; i < out.length; i++) out[i] = out[i] ^ 0xff;
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
        // return no outbound messages to keep tests focused on decryption behavior
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


// Reset mocks between tests for clearer assertions
beforeEach(() => {
    vi.clearAllMocks();
});

describe("decryptedMessage (via receiveTransactionsData)", () => {
    it("should decrypt inbound message body and clear payload encryption flag", async () => {
        // Prepare a body with a known serialized value
        const body = {
            serialize: () => Buffer.from([0xaa, 0x55]),
            deserialize: vi.fn(function (buf: Buffer) {
                // store deserialized data for assertions
                (this as any).last = Buffer.from(buf);
            }),
        };

        // Create a MessageNode-like object (plain object)
        const inboundMessage: any = {
            serialize: () => Buffer.from("00", "hex"),
            isPayloadEncrypted: () => true,
            isPayloadCompressed: () => false,
            getBody: () => body,
            data: Buffer.from([0xde, 0xad]),
            getMessageId: () => 1,
            getSequence: () => 0,
            setPayloadEncryption: function (val: boolean) {
                this._payloadEncrypted = val;
            },
        };

        const result = await receiveTransactionsData({
            connectionId: "conn-1",
            message: inboundMessage,
        });

        // handler returns no outbound messages, so messages array should be empty
        expect(result.connectionId).toEqual("conn-1");
        expect(result.messages).toHaveLength(0);

        // body.deserialize should have been called with decrypted data (xor 0xff transformation)
        expect(body.deserialize).toHaveBeenCalled();
        const calledWith = (body.deserialize as unknown as Mock).mock.calls[0][0] as Buffer;
        expect(calledWith).toBeInstanceOf(Buffer);
        expect(calledWith.length).toEqual(2);
        // ensure payload encryption flag was cleared on the object
        expect(inboundMessage._payloadEncrypted).toBe(false);
    });

    it("accepts ServerPacket-like objects interchangeably with MessageNode-like objects", async () => {
        // Create a ServerPacket-like class instance (different prototype)
        class ServerPacketLike {
            body: any;
            _payloadEncrypted = true;
            constructor(body: any) {
                this.body = body;
            }
            serialize() {
                return Buffer.from("01", "hex");
            }
            isPayloadEncrypted() {
                return true;
            }
            isPayloadCompressed() {
                return false;
            }
            getBody() {
                return this.body;
            }
            getMessageId() {
                return 1;
            }
            getSequence() {
                return 0;
            }
            setPayloadEncryption(val: boolean) {
                this._payloadEncrypted = val;
            }
        }

        const body = {
            serialize: () => Buffer.from([0x10, 0x20, 0x30]),
            deserialize: vi.fn(function (buf: Buffer) {
                (this as any).last = Buffer.from(buf);
            }),
        };

        const packet = new ServerPacketLike(body);

        const result = await receiveTransactionsData({
            connectionId: "conn-2",
            message: packet as unknown as any,
        });

        expect(result.connectionId).toEqual("conn-2");
        expect(result.messages).toHaveLength(0);

        // Ensure deserialize was called on the body and payload encryption flag cleared
        expect(body.deserialize).toHaveBeenCalled();
        expect(packet._payloadEncrypted).toBe(false);
    });
});