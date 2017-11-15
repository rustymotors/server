const TCPManager = require("./TCPManager.js");

test("438 = MC_CLIENT_CONNECT_MSG", () => {
  expect(TCPManager.MSG_STRING(438)).toBe("MC_CLIENT_CONNECT_MSG");
});
