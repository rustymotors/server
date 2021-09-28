import { AppConfiguration } from ".";

const savedConfig: AppConfiguration = {
  certificate: {
    privateKeyFilename: "data/private_key.pem",
    publicKeyFilename: "data/pub.key",
    certFilename: "data/mcouniverse.crt",
  },
  serverSettings: {
    ipServer: "0.0.0.0",
  },
  serviceConnections: {
    databaseURL: "db.mco.db",
  },
  defaultLogLevel: "info",
};
export { savedConfig };
