import { NPSUserStatus } from "./npsUserStatus";

describe("NPSUserStatus", () => {
  test("can create an instance", () => {
    const testPacket = Buffer.from([0x7b, 0x00]);
    const npsUserStatus = new NPSUserStatus(testPacket);
    expect(npsUserStatus.opCode).toBe(123);
  });
});
