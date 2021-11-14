const { MessageNode } = require("../../message-types/src/messageNode.js");
const { EMessageDirection } = require("../src/types.js");
const { SocketFactory } = require("../../test-helpers/socket-factory.js");
const { TCPConnection } = require("../../core/src/tcpConnection.js");
const t = require("tap");
const { compressIfNeeded } = require("../src/tcp-manager.js");
const { Buffer } = require("buffer");

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
