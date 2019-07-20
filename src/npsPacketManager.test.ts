import { NPSPacketManager } from "./npsPacketManager";
import { Logger } from "./services/shared/logger";

const loggers = new Logger().getLoggers();

describe("NPSPacketManger", () => {
  test("can find name for 0x229", () => {
    const npsPacketManager = new NPSPacketManager(loggers);
    expect(npsPacketManager.msgCodetoName(0x229)).toEqual("NPS_MINI_USER_LIST");
  });
});
