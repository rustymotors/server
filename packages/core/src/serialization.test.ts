import { describe, it, expect } from "vitest";
import {
    AddPersona,
    GameLogin,
    GameLoginReply,
    GetPersonaInfoRequest,
    GetPersonaMapListRequest,
    Header,
    Login,
    LoginRequestReply,
    Persona,
    SerializedBase,
    SerializedList,
    SessionKey,
    UserAction,
    UserStatusRequest,
} from "./serialization.js";

describe("serialization", () => {
    describe("SerializedBase", () => {
        it("should throw on serialize", () => {
            const serialized = new SerializedBase();
            expect(() => serialized.serialize()).toThrow();
        });

        it("should throw on deserialize", () => {
            const serialized = new SerializedBase();
            expect(() => serialized.deserialize(Buffer.from([]))).toThrow();
        });
    });

    describe.skip("AddPersona", () => {});

    describe.skip("GameLogin", () => {});

    describe.skip("GameLoginReply", () => {});

    describe.skip("GetPersonaInfoRequest", () => {});

    describe.skip("GetPersonaMapListRequest", () => {});

    describe.skip("Header", () => {});

    describe("Login", () => {
        it("should serialize", () => {
            const login = new Login();
            login.header = new Header();
            login.sessionKey = "sessionKey";
            login.encryptedSessionKey = "encryptionKey";

            const expected = Buffer.from([
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x0a, 0x73, 0x65, 0x73, 0x73, 0x69, 0x6f,
                0x6e, 0x4b, 0x65, 0x79, 0x00, 0x00, 0x0d, 0x65, 0x6e, 0x63,
                0x72, 0x79, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x4b, 0x65, 0x79,
                0x00, 0x04, 0x32, 0x31, 0x37, 0x36, 0x00,
            ]);

            const buf = login.serialize();
            expect(buf).toEqual(expected);
        });

        it("should deserialize", () => {
            const login = new Login();
            const buf = Buffer.from([
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x0a, 0x73, 0x65, 0x73, 0x73, 0x69, 0x6f,
                0x6e, 0x4b, 0x65, 0x79, 0x00, 0x00, 0x0d, 0x65, 0x6e, 0x63,
                0x72, 0x79, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x4b, 0x65, 0x79,
                0x00, 0x04, 0x32, 0x31, 0x37, 0x36, 0x00,
            ]);

            login.deserialize(buf);
            expect(login.sizeOf()).toEqual(buf.byteLength);
            expect(login.sessionKey).toEqual("sessionKey");
            expect(login.encryptedSessionKey).toEqual("encryptionKey");
        });
    });

    describe.skip("LoginRequestReply", () => {});

    describe.skip("Persona", () => {});

    describe.skip("SerializedList", () => {});

    describe.skip("SessionKey", () => {});

    describe.skip("UserAction", () => {});

    describe.skip("UserStatusRequest", () => {});
});
