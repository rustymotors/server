const fs = require("fs");
const NodeRSA = require("node-rsa");
const logger = require("../../src/logger.js");
const configurationFile = require("../../config/config.json");

function initCrypto() {
  const config = configurationFile.serverConfig;
  try {
    fs.statSync(config.privateKeyFilename);
  } catch (e) {
    logger.error(`Error loading private key: ${e}`);
    process.exit(1);
  }
  // privateKey = new NodeRSA(fs.readFileSync(config.privateKeyFilename))
  return new NodeRSA(fs.readFileSync(config.privateKeyFilename));
}

// struct LoginPacket
function LoginPacket(socket, packet) {
  if (!(this instanceof LoginPacket)) {
    return new LoginPacket(socket, packet);
  }

  this.opCode = packet.readInt16LE();

  const decrypt = initCrypto();

  const encryptedKeySetB64 = Buffer.from(
    packet.slice(52, -10).toString("utf8"),
    "hex"
  ).toString("base64");
  const decrypted = decrypt.decrypt(encryptedKeySetB64, "base64");
  this.sessionKey = Buffer.from(
    Buffer.from(decrypted, "base64")
      .toString("hex")
      .substring(4, 68),
    "hex"
  );
}

module.exports = LoginPacket;
