import { ISocketTestFactory } from "../../shared/index.js";
import { releaseQueue } from "../src/releaseQueue.js";
import { describe, it, expect } from "vitest";

describe("releaseQueue", () => {
    it("returns a JSON success response when connections exist", () => {
        const connections = [
            {
                connectionId: "1",
                seq: 0,
                id: "1",
                remoteAddress: "",
                socket: ISocketTestFactory(),
                localPort: 1,
                inQueue: false,
                personaId: 0,
                lastMessageTimestamp: 0,
                useEncryption: false,
            },
            {
                connectionId: "2",
                seq: 0,
                id: "2",
                socket: ISocketTestFactory(),
                remoteAddress: "",
                localPort: 2,
                inQueue: true,
                personaId: 0,
                lastMessageTimestamp: 0,
                useEncryption: false,
            },
        ];
        const response = releaseQueue(connections, "1");
        expect(response.code).toBe(200);
        expect(response.headers).toEqual({ "Content-Type": "application/json" });
        expect(response.body).toBe(JSON.stringify({ message: "ok" }));
    });

    it("returns a JSON error response when connections do not exist", () => {
        const connections = [
            {
                connectionId: "1",
                seq: 0,
                id: "1",
                remoteAddress: "",
                socket: ISocketTestFactory(),
                localPort: 1,
                inQueue: false,
                personaId: 0,
                lastMessageTimestamp: 0,
                useEncryption: false,
            },
            {
                connectionId: "2",
                seq: 0,
                id: "2",
                socket: ISocketTestFactory(),
                remoteAddress: "",
                localPort: 2,
                inQueue: true,
                personaId: 0,
                lastMessageTimestamp: 0,
                useEncryption: false,
            },
        ];
        const response = releaseQueue(connections, "3");
        expect(response.code).toBe(422);
        expect(response.headers).toEqual({ "Content-Type": "application/json" });
        expect(response.body).toBe(JSON.stringify({ message: "connection not found" }));
    }
    );
});