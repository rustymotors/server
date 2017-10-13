const opcodes = {
  0x501: "NPS_USER_LOGIN"
};

function getOpcodeByHex(hexOpcode) {
  if (opcodes[hexOpcode]) {
    return opcodes[hexOpcode];
  }
  return `Unknown OPCODE: ${hexOpcode.toString("16")}`;
}

module.exports = {
  getOpcodeByHex
};
