import { NPSPacketManager } from "./npsPacketManager";

describe("NPSPacketManger", () => {
  test("can find name for 0x229", () => {
    const npsPacketManager = new NPSPacketManager();
    expect(npsPacketManager.msgCodetoName(0x229)).toEqual("NPS_MINI_USER_LIST");
  });
});
