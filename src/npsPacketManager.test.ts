import { NPSPacketManager } from "./npsPacketManager";
import { Logger } from "./services/shared/logger";
import { ConfigManager } from "./configManager";
import { DatabaseManager } from "./databaseManager";

const loggers = new Logger().getLoggers();
const config = new ConfigManager().getConfig();
const database = new DatabaseManager(loggers);

describe("NPSPacketManger", () => {
  test("can find name for 0x229", () => {
    const npsPacketManager = new NPSPacketManager(loggers, config, database);
    expect(npsPacketManager.msgCodetoName(0x229)).toEqual("NPS_MINI_USER_LIST");
  });
});
