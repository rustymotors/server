import { NPSPersonaMapsMsg } from "./NPSPersonaMapsMsg";
import { MSG_DIRECTION } from "../../messageTypes/NPSMsg";

describe("NPSPersonaMapsMsg", () => {
  const npsPersonaMapsMsg = new NPSPersonaMapsMsg(MSG_DIRECTION.RECIEVED);
  test("direction is set correctly", () => {
    expect(npsPersonaMapsMsg.direction).toEqual(MSG_DIRECTION.RECIEVED);
    expect(npsPersonaMapsMsg.msgNo).toEqual(0x607);
  });
});
