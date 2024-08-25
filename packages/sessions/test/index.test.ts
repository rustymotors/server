import { beforeEach, describe, expect, it } from "vitest";
import { saveClientConnection, clearConnectedClients, findClientByCustomerId, hasClientEncryptionPair, newClientConnection, setClientEncryption } from "../index.js"

describe("Client connections", () => {
    describe("newClientConnection", () => {
        it("should create a new client connection", () => {
            const connectionId = "123";
            const customerId = 456;

            const client = newClientConnection(connectionId, customerId);

            expect(client.connectionId).toBe(connectionId);
            expect(client.customerId).toBe(customerId);
            expect(client.gameEncryptionHandshakeComplete).toBe(false);
            expect(client.serverEncryptionHandshakeComplete).toBe(false);
        });
    });

    describe("saveClientConnection", () => {
        it("should save a client connection", () => {
            const connectionId = "123";
            const customerId = 456;
            const client = newClientConnection(connectionId, customerId);

            saveClientConnection(connectionId, client);

            expect(findClientByCustomerId(customerId)).toBe(client);
        });
    });

    describe("findClientByCustomerId", () => {

        beforeEach(() => {
            clearConnectedClients();
        });

        it("should find a client by customer ID", () => {
            const connectionId = "123";
            const customerId = 456;
            const client = newClientConnection(connectionId, customerId);
            saveClientConnection(connectionId, client);

            expect(findClientByCustomerId(customerId)).toBe(client);
        });

        it("should throw an error if the client is not found", () => {
            const customerId = 456;

            expect(() => findClientByCustomerId(customerId)).toThrow(
                `Client with customer ID ${customerId} not found`,
            );
        });
    });

    describe("hasClientEncryptionPair", () => {
        it("should return true if the client has an encryption pair", () => {
            const connectionId = "123";
            const customerId = 456;
            const client = newClientConnection(connectionId, customerId);
            saveClientConnection(connectionId, client);

            expect(hasClientEncryptionPair(client, "game")).toBe(false);
            expect(hasClientEncryptionPair(client, "server")).toBe(false);

            setClientEncryption(client, "sessionKey");

            expect(hasClientEncryptionPair(client, "game")).toBe(true);
            expect(hasClientEncryptionPair(client, "server")).toBe(true);
        });
    });

    describe("clearConnectedClients", () => {
        it("should clear all connected clients", () => {
            const connectionId = "123";
            const customerId = 456;
            const client = newClientConnection(connectionId, customerId);
            saveClientConnection(connectionId, client);

            clearConnectedClients();

            expect(() => findClientByCustomerId(customerId)).toThrow(
                `Client with customer ID ${customerId} not found`,
            );
        });
    });
});
    