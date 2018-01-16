const { isBuffer, isNumber } = require("util");

const crypto = require("crypto");
const logger = require("./logger.js");

function ARC4(keyData, len = 16) {
  if (!isBuffer(keyData)) {
    console.error(typeof keyData);
    throw new Error("ARC4 Error: key setup: Key must be a buffer.");
  }

  this.key_ptr_data = Buffer.from(keyData);
}

ARC4.prototype.EncodeString = function(str, length = 48) {
  if (!isBuffer(str)) {
    console.error(typeof str);
    throw new Error("ARC4 Error: str must be a buffer.");
  }
  return crypto.createCipheriv("rc4", this.key_ptr_data, "").update(str);
};

ARC4.prototype.DecodeString = function(str, length = 48) {
  return this.EncodeString(str, length);
};

module.exports = { ARC4 };
