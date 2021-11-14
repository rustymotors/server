const t = require("tap");
const { DatabaseManager } = require("../src/index.js");

/** @type {import("../../config/src").AppConfiguration} */
const testConfig = {
  certificate: {
    privateKeyFilename: "",
    publicKeyFilename: "",
    certFilename: "",
  },
  serverSettings: {
    ipServer: "",
  },
  serviceConnections: {
    databaseURL: "testDB.db",
  },
  defaultLogLevel: "debug",
};

t.test("Database", async (t) => {
  t.doesNotThrow(() => DatabaseManager.getInstance());
  const db = DatabaseManager.getInstance();
  await db.init(testConfig);
  t.doesNotThrow(() => db.closeDB());
  t.end();
});
