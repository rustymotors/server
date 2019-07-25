import { PatchServer } from "./patchServer";
import * as fs from "fs";
import { ConfigManager } from "../shared/configManager";

// get instance of config
const config = new ConfigManager().getConfig();

describe("PatchServer", () => {
  const patchServer = new PatchServer();

  test("castanetResponse", () => {
    expect(patchServer.castanetResponse.body.toString("hex")).toEqual(
      "cafebeef00000000000003"
    );
  });

  test("patchUpdateInfo()", () => {
    expect(patchServer._patchUpdateInfo().body.toString("hex")).toEqual(
      "cafebeef00000000000003"
    );
  });

  test("patchNPS()", () => {
    expect(patchServer._patchNPS().body.toString("hex")).toEqual(
      "cafebeef00000000000003"
    );
  });

  test("patchMCO()", () => {
    expect(patchServer._patchMCO().body.toString("hex")).toEqual(
      "cafebeef00000000000003"
    );
  });

  test("generateShardList()", () => {
    expect(patchServer._generateShardList()).toEqual(
      expect.stringContaining("The Clocktower")
    );
  });

  test("getBans()", () => {
    expect(patchServer._getBans()).toEqual([]);
  });
});
