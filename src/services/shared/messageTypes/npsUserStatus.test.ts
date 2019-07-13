import { NPSUserStatus } from "./npsUserStatus";
import { Logger } from "../logger";
import { IServerConfiguration } from "../interfaces/IServerConfiguration";

const loggers = new Logger().getLoggers();

const testConfig: IServerConfiguration = {
  serverConfig: {
    ipServer: "1.1.1.1",
    certFilename: "na",
    publicKeyFilename: "na",
    privateKeyFilename: "na",
    registryFilename: "na",
  },
};

describe("NPSUserStatus", () => {
  test("can create an instance", () => {
    const testPacket = Buffer.from([0x7b, 0x00]);
    const npsUserStatus = new NPSUserStatus(
      testConfig,
      testPacket,
      loggers.both
    );
    expect(npsUserStatus.opCode).toBe(123);
  });
});
