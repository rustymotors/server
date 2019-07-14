import { PatchServer } from "./patchServer";
import { Logger } from "../shared/logger";
import * as fs from "fs";

// get instance of loggers
const loggers = new Logger().getLoggers();

// get instance of config
const config = JSON.parse(
  fs.readFileSync("./src/services/shared/config.json", "utf8")
);

describe("PatchServer", () => {
  const patchServer = new PatchServer(config, loggers);

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
