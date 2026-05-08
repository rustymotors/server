import { expect, suite, test } from "vitest";
import { RiffInfo } from "../src/Lobby.js";

suite("RiffInfo", () => {
    test("should initialize with default values", () => {
        const riffInfo = new RiffInfo();
        expect(riffInfo.riffName).toBe("");
        expect(riffInfo.protocol).toEqual(0);
        expect(riffInfo.commId).toEqual(0);
        expect(riffInfo.password).toBe("");
        expect(riffInfo.channelType).toEqual(0);
        expect(riffInfo.connectedUsersCount).toEqual(0);
        expect(riffInfo.openChannelsCount).toEqual(0);
        expect(riffInfo.isUserConnected).toEqual(false);
        expect(riffInfo.channelData.serialize()).toEqual(Buffer.alloc(256));
        expect(riffInfo.numReadyPlayers).toEqual(0);
        expect(riffInfo.maxReadyPlayers).toEqual(0);
        expect(riffInfo.channelOwnerId).toEqual(0);
        expect(riffInfo.gameServerIsRunning).toEqual(false);
    });
});