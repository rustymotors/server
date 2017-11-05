const npsOpcodes = require("./npsOpcodes.js");

test("retuns valid opcode", () => {
  expect(npsOpcodes.getOpcodeByHex(0x0501)).toBe("NPS_USER_LOGIN");
});

test("retuns invalid opcode", () => {
  expect(npsOpcodes.getOpcodeByHex(0x0601)).toBe("Unknown OPCODE: 601");
});
