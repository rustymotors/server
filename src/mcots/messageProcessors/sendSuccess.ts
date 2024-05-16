import {
  ServerGenericResponse,
  ServerMessage,
} from "@rustymotors/shared-packets";
import type { ServerSocketCallback } from "./index.js";

export function sendSuccess(
  message: ServerMessage,
  socketCallback: ServerSocketCallback
) {
  const pReply = new ServerGenericResponse();
  pReply.setMessageId(101);
  pReply.setMsgReply(438);

  const response = new ServerMessage(101);
  response.setData(pReply);
  response.populateHeader(message.getSequence());

  socketCallback([response]);
}
