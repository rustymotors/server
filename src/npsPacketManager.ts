import { ILoggers } from "./services/shared/logger";
import { IRawPacket } from "./services/shared/interfaces/IRawPacket";

export class NPSPacketManager {
  public loggers: ILoggers;
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

  constructor(loggers: ILoggers) {
    this.loggers = loggers;
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

  public processNPSPacket(rawPacket: IRawPacket) {
    let msgId = rawPacket.data.readInt16BE(0);
    if (msgId === 0x1101) {
      // This packet needs to be decrypted first
      this.loggers.both.debug(`packet needs to be decrypted`);
      if (this.npsKey === "") {
        throw new Error(
          `[npsPacketManager] Attempted to decrypt packet before setting key`
        );
      }
    }

    this.loggers.both.debug(
      `[npsPacketManger] Handling message ${this.msgCodetoName(msgId)}`
    );
  }
}
