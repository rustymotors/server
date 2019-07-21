import { NPSUserInfo } from "./npsUserInfo";
import { MSG_DIRECTION } from "./NPSMsg";

describe("NPSUserInfo", () => {
  test("can create an instance", () => {
    const testPacket = Buffer.concat([
      Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x84, 0x5f, 0xed]),
      Buffer.alloc(98),
    ]);
    const npsUserInfo = new NPSUserInfo(MSG_DIRECTION.RECIEVED);
    npsUserInfo.deserialize(testPacket);
    expect(npsUserInfo.userId).toBe(8675309);
  });
});
