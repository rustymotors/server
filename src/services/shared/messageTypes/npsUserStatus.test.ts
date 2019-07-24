import { NPSUserStatus } from "./npsUserStatus";
import { IServerConfiguration } from "../interfaces/IServerConfiguration";

const testConfig: IServerConfiguration = {
  serverConfig: {
    ipServer: "1.1.1.1",
    certFilename: "na",
    publicKeyFilename: "na",
    privateKeyFilename: "na",
    registryFilename: "na",
  },
  statsDHost: "na",
};

describe("NPSUserStatus", () => {
  test("can create an instance", () => {
    const testPacket = Buffer.from([0x7b, 0x00]);
    const npsUserStatus = new NPSUserStatus(testConfig, testPacket);
    expect(npsUserStatus.opCode).toBe(123);
  });
});
