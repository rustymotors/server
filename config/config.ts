interface IConfigurationFile {
  loggerLevel: string;
  serverConfig: {
    certFilename: string,
    ipServer: string,
    privateKeyFilename: string,
    publicKeyFilename: string,
    serverDatabase: {
      name: string,
      port: number,
    },
    serverLobby: {
      name: string,
      port: number,
    },
    serverLogin: {
      name: string,
      port: number,
    },
    serverPersona: {
      name: string,
      port: number,
    },
  };
}

export const config: IConfigurationFile = {
  loggerLevel: "debug",
  serverConfig: {
    certFilename: "./data/cert.pem",
    ipServer: "mc.drazisil.com",
    privateKeyFilename: "./data/private_key.pem",
    publicKeyFilename: "./data/pub.key",
    serverDatabase: {
      name: "Database",
      port: 43300,
    },
    serverLobby: {
      name: "Lobby",
      port: 7003,
    },
    serverLogin: {
      name: "Login",
      port: 8226,
    },
    serverPersona: {
      name: "Persona",
      port: 8228,
    },
  },
};
