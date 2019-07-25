import { IRawPacket } from "../shared/interfaces/IRawPacket";
import { LoginServer } from "./LoginServer/LoginServer";
import { PersonaServer } from "./PersonaServer/PersonaServer";
import { LobbyServer } from "./LobbyServer/LobbyServer";
import { DatabaseManager } from "../shared/databaseManager";

import { Logger } from "../shared/loggerManager";
import { ConfigManager } from "../shared/configManager";

export class NPSPacketManager {
  public logger = new Logger().getLogger("NPSPacketManager");
  public config = new ConfigManager().getConfig();
  public database = new DatabaseManager();
  public loginServer: LoginServer;
  public personaServer: PersonaServer;
  public lobbyServer: LobbyServer;
  public npsKey: string = "";
  public msgNameMapping = [
    { id: 0x100, name: "NPS_LOGIN" },
    { id: 0x120, name: "NPS_LOGIN_RESP" },
    { id: 0x128, name: "NPS_GET_MINI_USER_LIST" },
    { id: 0x207, name: "NPS_ACK" },
    { id: 0x229, name: "NPS_MINI_USER_LIST" },
    { id: 0x30c, name: "NPS_SEND_MINI_RIFF_LIST" },
    { id: 0x501, name: "NPS_USER_LOGIN" },
    { id: 0x503, name: "NPS_REGISTER_GAME_LOGIN" },
    { id: 0x532, name: "NPS_GET_PERSONA_MAPS" },
    { id: 0x607, name: "NPS_GAME_ACCOUNT_INFO" },
    { id: 0x1101, name: "NPS_CRYPTO_DES_CBC" },
  ];

  constructor() {
    this.loginServer = new LoginServer();
    this.personaServer = new PersonaServer();
    this.lobbyServer = new LobbyServer();
  }

  public msgCodetoName(msgId: number) {
    const mapping = this.msgNameMapping.find(mapping => {
      return mapping.id === msgId;
    });
    return mapping ? mapping.name : "Unknown msgId";
  }

  public getNPSKey() {
    return this.npsKey;
  }

  public setNPSKey(key: string) {
    this.npsKey = key;
  }

  public async processNPSPacket(rawPacket: IRawPacket) {
    let msgId = rawPacket.data.readInt16BE(0);
    this.logger.info(
      `[npsPacketManger] Handling message ${this.msgCodetoName(msgId)}`
    );

    const { localPort } = rawPacket;

    switch (localPort) {
      case 8226:
        return this.loginServer.dataHandler(rawPacket, this.config);
      case 8228:
        return this.personaServer.dataHandler(rawPacket);
      case 7003:
        return this.lobbyServer.dataHandler(rawPacket);
      default:
        this.logger.error({
          message: `[npsPacketManager] Recieved a packet`,
          msgId,
          localPort,
        });
        return rawPacket.connection;
    }
  }
}
