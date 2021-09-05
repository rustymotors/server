/**
 */
/**
 *
 *
 * @class
 * @property {number} msgNo
 * @property {number} personaId
 * @property {number} appId
 * @property {number} customerId
 * @property {string} custName
 * @property {string} personaName
 * @property {Buffer} mcVersion
 */
export class ClientConnectMessage {
  /**
   *
   * @param {Buffer} buffer
   */
  constructor(buffer: Buffer)
  msgNo: number
  personaId: number
  appId: number
  customerId: number
  custName: string
  personaName: string
  mcVersion: Buffer
  /**
   *
   * @return {number}
   */
  getAppId(): number
  /**
   * DumpPacket
   * @return {void}
   */
  dumpPacket(): void
}
