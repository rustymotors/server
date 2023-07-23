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

    describe("Header", () => {
        it("should allow passing in values to constructor", () => {
            const values = {
                messageCode: 12279,
                messageLength: 0,
                messageVersion: 0,
                messageChecksum: 5,
            };

            const header = new Header(values);
            expect(header.messageCode).toEqual(values.messageCode);
            expect(header.messageLength).toEqual(values.messageLength);
            expect(header.messageVersion).toEqual(values.messageVersion);
            expect(header.messageChecksum).toEqual(values.messageChecksum);
        });

        it("should have a default constructor", () => {
            const header = new Header();
            expect(header.messageCode).toEqual(0);
            expect(header.messageLength).toEqual(0);
            expect(header.messageVersion).toEqual(0);
            expect(header.messageChecksum).toEqual(0);
        });

        it("should serialize", () => {
            const header = new Header();
            header.messageCode = 1281;
            header.messageLength = 318;
            header.messageVersion = 257;
            header.messageChecksum = 318;

            const expected = Buffer.from([
                0x05, 0x01,

                0x01, 0x3e,

                0x01, 0x01,

                0x00, 0x00,

                0x00, 0x00, 0x01, 0x3e,
            ]);

            const buf = header.serialize();
            expect(buf).toEqual(expected);
        });
    });

    describe("Login", () => {
        it("should allow optional constructior of header", () => {
            const header = new Header();

            const login = new Login({ header });
            expect(login.header).toBeInstanceOf(Header);
        });

        it("should allow optional constructior of sessionKey", () => {
            const values = {
                sessionKey: "sessionKey",
            };

            const login = new Login(values);
            expect(login.sessionKey).toEqual(values.sessionKey);
        });

        it("should allow optional constructior of encryptedSessionKey", () => {
            const values = {
                encryptedSessionKey: "encryptionKey",
            };
            const login = new Login(values);
            expect(login.encryptedSessionKey).toEqual(
                values.encryptedSessionKey,
            );
        });

        it("should have a default constructor", () => {
            const login = new Login();
            expect(login.encryptedSessionKey).toEqual("");
        });

        it("should have a default GAME_CODE", () => {
            const login = new Login();
            expect(login.GAME_CODE).toEqual("2176");
        });

        it("should have a default v2P82", () => {
            const login = new Login();
            expect(login.v2P82).toEqual(false);
        });

        it("should have a default v2P187", () => {
            const login = new Login();
            expect(login.v2P187).toEqual(false);
        });

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
