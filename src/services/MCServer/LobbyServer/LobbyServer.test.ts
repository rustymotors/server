import { LobbyServer } from "./LobbyServer";

describe("LobbyServer", () => {
  const lobbyServer = new LobbyServer();
  test("_generateSessionKeyBuffer", () => {
    expect(lobbyServer._generateSessionKeyBuffer("123").length).toEqual(64);
  });
});
