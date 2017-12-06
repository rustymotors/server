const { isBuffer } = require("util");

const crypto = require("crypto");

function ARC4(keyData, len = 16) {
  if (!isBuffer(keyData)) {
    console.log(typeof keyData);
    throw new Error("ARC4 Error: Key must be a buffer.");
  }

  this.key_ptr_data = Buffer.from(keyData);
}

ARC4.prototype.EncodeString = function(str, length = str.length) {
  return crypto.createCipheriv("rc4", this.key_ptr_data, "").update(str);
};

ARC4.prototype.DecodeString = function(str, length) {
  return crypto.createDecipheriv("rc4", this.key_ptr_data, "").update(str);
};

module.exports = { ARC4 };
