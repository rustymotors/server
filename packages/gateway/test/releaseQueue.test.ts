import { releaseQueue } from "../src/releaseQueue.js";
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import {
    State,
    addQueuedConnection,
    addSocket,
    createInitialState,
    getQueuedConnections,
    getSockets,
    wrapSocket,
} from "../../shared/State.js";
import { Socket } from "node:net";

let testSave: (state: State ) => void;
let testState: State;
let testSocket: Socket;

describe("releaseQueue", () => {
    beforeAll(() => {
        testSave = ( state: State ) => {
            testState = state;
        };
        testState = createInitialState({
            saveFunction: testSave,
        });
        testSocket = new Socket();
        testSocket.write = vi.fn().mockImplementation(() => {
            // Do nothing
        });
    });

    beforeEach(() => {
        testState = createInitialState({
            saveFunction: testSave,
        });
    });

    it("returns a JSON success response when connections exist", () => {
        // Arrange
        const id = "1";
        const wrapped = wrapSocket(testSocket, id);

        // Act + Assert

        testState = addSocket(testState, wrapped);

        testState = addQueuedConnection(testState, wrapped);

        expect(getQueuedConnections(testState)).toHaveLength(1);

        const response = releaseQueue({ state: testState, connectionId: id });

        expect(response.code).toBe(200);
        expect(response.headers).toEqual({
            "Content-Type": "application/json",
        });
        expect(response.body).toBe(
            JSON.stringify({ message: "connection removed from queue" }),
        );

        expect(getQueuedConnections(testState)).toHaveLength(0);
    });

    it("returns a JSON error response when the connection is not queued", () => {
        // Arrange
        const id = "2";

        // Act + Assert

        expect(getQueuedConnections(testState)).toHaveLength(0);

        const response = releaseQueue({ state: testState, connectionId: id });

        expect(response.code).toBe(422);
        expect(response.headers).toEqual({
            "Content-Type": "application/json",
        });
        expect(response.body).toBe(
            JSON.stringify({ message: "connection not queued" }),
        );
    });

    it("returns a JSON error response when the connection is not found");
});
