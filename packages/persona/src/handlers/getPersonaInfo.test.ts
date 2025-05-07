import { describe, it, expect, Mock, vi } from "vitest";
import { getPersonaInfo } from "./getPersonaInfo.js";
import { LegacyMessage, NPSMessage, SerializedBufferOld, ServerLogger } from "rusty-motors-shared";
import { getPersonasByPersonaId } from "../getPersonasByPersonaId.js";
import { personaToString } from "../internal.js";

vi.mock("../getPersonasByPersonaId");
vi.mock("../internal");
vi.mock("rusty-motors-shared", () => ({
    LegacyMessage: vi.fn(),
    NPSMessage: vi.fn(() => ({
        deserialize: vi.fn(),
        data: {
            readUInt32BE: vi.fn(),
        },
        toString: vi.fn(),
    })),
    SerializedBufferOld: vi.fn(() => ({
        setBuffer: vi.fn(),
    })),
    getServerLogger: vi.fn(() => ({
        debug: vi.fn(),
    })),
    RawMessage: vi.fn(() => ({
        serialize: vi.fn(),
    })),
    NetworkMessage: vi.fn(() => ({
        serialize: vi.fn(),
    })),
}));

describe("getPersonaInfo", () => {
    const mockLogger = {
        debug: vi.fn(),
    } as unknown as ServerLogger;

    const mockMessage = {
        serialize: vi.fn(),
    } as unknown as LegacyMessage;

    const mockPersona = [
        {
            customerId: 123,
            personaId: 456,
            personaName: "TestPersona",
        },
    ];

    it("should return persona information when persona is found", async () => {
        const mockConnectionId = "test-connection-id";

        (getPersonasByPersonaId as Mock).mockResolvedValue(mockPersona);
        (personaToString as Mock).mockReturnValue("PersonaString");
        (NPSMessage.prototype.data.readUInt32BE as Mock).mockReturnValue(456);

        const result = await getPersonaInfo({
            connectionId: mockConnectionId,
            message: mockMessage,
            log: mockLogger,
        });

        expect(result.connectionId).toBe(mockConnectionId);
        expect(result.messages).toHaveLength(1);
        expect(result.messages[0]).toBeInstanceOf(SerializedBufferOld);
        expect(mockLogger.debug).toHaveBeenCalled();
    });

    it("should throw an error when persona is not found", async () => {
        const mockConnectionId = "test-connection-id";

        (getPersonasByPersonaId as Mock).mockResolvedValue([]);
        (NPSMessage.prototype.data.readUInt32BE as Mock).mockReturnValue(456);

        await expect(
            getPersonaInfo({
                connectionId: mockConnectionId,
                message: mockMessage,
                log: mockLogger,
            })
        ).rejects.toThrow("Persona not found for personaId: 456");

        expect(mockLogger.debug).toHaveBeenCalled();
    });
});