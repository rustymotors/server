import { NPSMessage, NPSMessageValues } from "../message-types";
import { EMessageDirection } from "../types";

/**
 * Create a fresh NPSMessage with known values
 * @param {Partial<NPSMessageValues>} optionOverrides
 * @returns {NPSMessage}
 */
export function createEmptyNPSMessage(
  optionOverrides: Partial<NPSMessageValues>
): NPSMessage {
  const msgNo = optionOverrides.msgNo || 0;
  const msgVersion = optionOverrides.msgVersion || 0;
  const content =
    optionOverrides.content || Buffer.from([0x01, 0x02, 0x03, 0x04]);
  const msgLength = optionOverrides.msgLength || content.length + 12; // skipcq: JS-0377
  const direction = optionOverrides.direction || EMessageDirection.UNDEFINED;
  const serviceName = optionOverrides.serviceName || "testNPSMessage";

  const newNPSMessage = new NPSMessage(direction);

  newNPSMessage.msgNo = msgNo;
  newNPSMessage.msgVersion = msgVersion;
  newNPSMessage.content = content;
  newNPSMessage.msgLength = msgLength;
  newNPSMessage.direction = direction;
  newNPSMessage.serviceName = serviceName;

  return newNPSMessage;
}
