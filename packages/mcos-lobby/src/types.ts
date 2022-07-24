import type { BufferWithConnection, GSMessageArrayWithConnection } from "mcos-shared/src/types/index.js";

export interface MessageHandler {
  opCode: number,
  name: string,
  handlerFunction: (arg0: BufferWithConnection) => Promise<GSMessageArrayWithConnection>
}
