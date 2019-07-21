import { NPSPacketManager } from "./npsPacketManager";
import { ConfigManager } from "./configManager";
import { DatabaseManager } from "./databaseManager";

const config = new ConfigManager().getConfig();
const database = new DatabaseManager();

describe("NPSPacketManger", () => {
  test("can find name for 0x229", () => {
    const npsPacketManager = new NPSPacketManager(config, database);
    expect(npsPacketManager.msgCodetoName(0x229)).toEqual("NPS_MINI_USER_LIST");
  });
});
