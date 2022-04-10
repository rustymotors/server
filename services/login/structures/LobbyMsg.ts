import {
  BinObject,
  EBinaryFieldType,
  IBinaryField,
} from "../../shared/structures/BinObject";
import { LobbyInfo } from "./LobbyInfo";
/**
 * This structure holds the fields for a LobbyMsg packet
 *
 * @export
 * @class LobbyMsg
 * @extends {BinObject}
 */
export class LobbyMsg extends BinObject {
  protected _byteOrder: "big" | "little" = "little";
  protected _fields: IBinaryField[] = [
    {
      name: "msgNo",
      type: EBinaryFieldType.NUMBER,
      size: 2,
      value: Buffer.alloc(2),
      notes: "nps opcode",
    },
    {
      name: "noLobbies",
      type: EBinaryFieldType.NUMBER,
      size: 2,
      value: Buffer.alloc(2),
      notes: "number of lobbies in message",
    },
    {
      name: "moreToCome",
      type: EBinaryFieldType.BOOLEAN,
      size: 1,
      value: Buffer.alloc(1),
      notes: "is this the final packet?",
    },
  ];

  private lobbies: LobbyInfo[] = [];
/**
 * Add a new lobby info record to the internal list
 *
 * @param {LobbyInfo} lobbyToAdd
 * @memberof LobbyMsg
 */
public pushLobby(lobbyToAdd: LobbyInfo): void {
    this.lobbies.push(lobbyToAdd);
    const newLobbyCount = Buffer.alloc(2);
    newLobbyCount.writeInt16LE(this.lobbies.length);
    this.updateFieldValue("noLobbies", newLobbyCount);
  }
}