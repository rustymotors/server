class RC4 {
  constructor(key) {
    this.keyBytes = Buffer.from(key, 'hex');
    this.keyLen = this.keyBytes.length;
    this.mState = Array(256);
    this.mX = 0;
    this.mY = 0;

    // eslint-disable-next-line no-plusplus
    for (let counter = 0; counter < 256; counter++) {
      this.mState[counter] = counter;
    }

    let index1 = 0;
    let j = 0;

    // eslint-disable-next-line no-plusplus
    for (let counter = 0; counter < 256; counter++) {
      // eslint-disable-next-line no-plusplus
      j = (j + this.mState[counter] + this.keyBytes[index1++]) % 256;
      this.swapByte(counter, j);
      if (index1 >= this.keyLen) {
        index1 = 0;
      }
    }
  }

  processString(inString) {
    const inBytes = Buffer.from(inString, 'hex');
    let idx1 = 0;
    let idx2 = 0;
    // eslint-disable-next-line prefer-destructuring
    let length = inBytes.length;
    const output = Buffer.alloc(length);
    const s = this.mState;
    let x = this.mX;
    let y = this.mY;

    // eslint-disable-next-line no-plusplus
    while (length--) {
      // eslint-disable-next-line no-bitwise
      x = (x + 1) & 0xff;
      const a = s[x];
      // eslint-disable-next-line no-bitwise
      y = (y + a) & 0xff;
      const b = s[y];
      s[x] = b;
      s[y] = a;

      // eslint-disable-next-line no-bitwise, no-plusplus
      output[idx1++] = inBytes[idx2++] ^ s[(a + b) & 0xff];
    }

    this.mX = x;
    this.mY = y;
    return output;
  }

  swapByte(b1, b2) {
    const t1 = this.mState[b1];
    this.mState[b1] = this.mState[b2];
    this.mState[b2] = t1;
  }
}

module.exports = { RC4 };
