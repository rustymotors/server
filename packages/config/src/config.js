/** @type {import(".").AppConfiguration} */
const savedConfig = {
  certificate: {
    privateKeyFilename: "data/private_key.pem",
    publicKeyFilename: "data/pub.key",
    certFilename: "data/mcouniverse.crt",
  },
  serverSettings: {
    ipServer: "0.0.0.0",
  },
  serviceConnections: {
    databaseURL: "mco.db",
  },
  defaultLogLevel: "debug",
};
module.exports = { savedConfig };
