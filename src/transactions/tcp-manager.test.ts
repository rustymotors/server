import { EMessageDirection } from "../types/index";
import { MessageNode } from "../message-types/index";
import { SocketFactory } from "../socket-factory";
import { TCPConnection } from "../core/tcpConnection";
import t from "tap";
import { compressIfNeeded } from "./tcp-manager";

t.test("TCP Manager", (t) => {
  t.test("compressIfNeeded()", async (t) => {
    const testNode = new MessageNode(EMessageDirection.SENT);
    const testBuffer = Buffer.alloc(20);
    testNode.updateBuffer(testBuffer);
    const testConnection = new TCPConnection(
      "testId",
      SocketFactory.createSocket()
    );
    const result = await compressIfNeeded(testConnection, testNode);
    t.match(result.lastError, "Too small, should not compress");
    t.end();
  });

  t.end();
});
