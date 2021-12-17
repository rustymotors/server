import { EMessageDirection } from "../types/index";
import { MessageNode } from "../message-types/index";
import { SocketFactory } from "../socket-factory";
import { TCPConnection } from "../core/tcpConnection";
import test from "ava";
import { compressIfNeeded } from ".";

  test("TCP Manager - compressIfNeeded()", async (t) => {
    const testNode = new MessageNode(EMessageDirection.SENT);
    const testBuffer = Buffer.alloc(20);
    testNode.updateBuffer(testBuffer);
    const testConnection = new TCPConnection(
      "testId",
      SocketFactory.createSocket()
    );
    const result = await compressIfNeeded(testConnection, testNode);
    t.is(result.lastError, "Too small, should not compress");

  });

  
