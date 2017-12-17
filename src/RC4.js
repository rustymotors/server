const { isBuffer, isNumber } = require("util");

const crypto = require("crypto");
const logger = require("./logger.js");

function ARC4(keyData, len = 16) {
  if (!isBuffer(keyData)) {
    console.log(typeof keyData);
    throw new Error("ARC4 Error: key setup: Key must be a buffer.");
  }

  this.key_ptr_data = Buffer.from(keyData);

  this.state = new Array(256);
  let index1 = new Number(0);
  let index2 = new Number(0);
  let counter = 0;

  for (counter = 0; counter < 256; counter++) {
    this.state[counter] = counter;
    if (!isNumber(this.state[counter])) {
      throw new Error(
        "ARC4 Error: state setup - phase 1: state is not a number!"
      );
    }
  }

  this.x = new Number(0);
  this.y = new Number(0);

  for (counter = 0; counter < 256; counter++) {
    index2 =
      ((this.key_ptr_data[index1++] || 0) + this.state[counter] + index2) % 256;
    if (!isNumber(this.key_ptr_data[index1++] || 0)) {
      logger.error(
        "this.key_ptr_data[index1]: ",
        this.key_ptr_data[index1],
        " - ",
        index1
      );
      throw new Error(
        "ARC4 Error: state setup - phase 2: this.key_ptr_data[index1++] is not a number!"
      );
    }
    index1++;
    if (!isNumber(this.state[counter])) {
      throw new Error(
        "ARC4 Error: state setup - phase 2: state is not a number!"
      );
    }
    if (!isNumber(this.state[index2])) {
      console.error("index2: ", index2);
      throw new Error(
        "ARC4 Error: state setup - phase 2: index2 is not a number!"
      );
    }
    // logger.debug(
    //   "1: this.state[counter]: ",
    //   this.state[counter],
    //   " this.state[index2]: ",
    //   this.state[index2]
    // );
    this._SwapByte(counter, index2);
    // logger.debug(
    //   "2: this.state[counter]: ",
    //   this.state[counter],
    //   " this.state[index2]: ",
    //   this.state[index2]
    // );
    if (index1 >= len) {
      index1 = 0;
    }
  }
}

ARC4.prototype._SwapByte = function(byte1, byte2) {
  const t1 = this.state[byte2];
  this.state[byte2] = this.state[byte1];
  this.state[byte1] = t1;
};

ARC4.prototype.EncodeString = function(str, length = 48) {
  return crypto.createCipheriv("rc4", this.key_ptr_data, "").update(str);
};

ARC4.prototype.DecodeString = function(str, length = 48) {
  if (!isBuffer(str)) {
    console.log(typeof keyData);
    throw new Error("ARC4 Error: str must be a buffer.");
  }

  let s = Buffer.from(str);

  for (counter = 0; counter < length; counter++) {
    let a = new Number(this.state[++this.x]);
    // logger.debug("a: ", a);
    this.y = (this.y + a) % 256;
    // logger.debug("y: ", this.y);
    let b = new Number(this.state[this.y]);
    // logger.debug("b: ", b);
    this.state[this.y] = a;
    // logger.debug("s[y]: ", this.state[this.y]);
    a = (a + b) % 256;
    // logger.debug("a: ", a);
    // logger.debug("1: counter: ", counter);
    // logger.debug("1: this.state[a]: ", this.state[a]);
    // logger.debug("1: s[counter]: ", s[counter]);
    s[counter] ^= this.state[a];
    // logger.debug("2: this.state[a]: ", this.state[a]);
    // logger.debug("2: str[counter]: ", s[counter]);
  }
  logger.debug(s);

  return crypto.createDecipheriv("rc4", this.key_ptr_data, "").update(str);
};

module.exports = { ARC4 };
