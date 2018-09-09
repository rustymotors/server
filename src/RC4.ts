const initialState = Buffer.from([
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  62,
  63,
  64,
  65,
  66,
  67,
  68,
  69,
  70,
  71,
  72,
  73,
  74,
  75,
  76,
  77,
  78,
  79,
  80,
  81,
  82,
  83,
  84,
  85,
  86,
  87,
  88,
  89,
  90,
  91,
  92,
  93,
  94,
  95,
  96,
  97,
  98,
  99,
  100,
  101,
  102,
  103,
  104,
  105,
  106,
  107,
  108,
  109,
  110,
  111,
  112,
  113,
  114,
  115,
  116,
  117,
  118,
  119,
  120,
  121,
  122,
  123,
  124,
  125,
  126,
  127,
  128,
  129,
  130,
  131,
  132,
  133,
  134,
  135,
  136,
  137,
  138,
  139,
  140,
  141,
  142,
  143,
  144,
  145,
  146,
  147,
  148,
  149,
  150,
  151,
  152,
  153,
  154,
  155,
  156,
  157,
  158,
  159,
  160,
  161,
  162,
  163,
  164,
  165,
  166,
  167,
  168,
  169,
  170,
  171,
  172,
  173,
  174,
  175,
  176,
  177,
  178,
  179,
  180,
  181,
  182,
  183,
  184,
  185,
  186,
  187,
  188,
  189,
  190,
  191,
  192,
  193,
  194,
  195,
  196,
  197,
  198,
  199,
  200,
  201,
  202,
  203,
  204,
  205,
  206,
  207,
  208,
  209,
  210,
  211,
  212,
  213,
  214,
  215,
  216,
  217,
  218,
  219,
  220,
  221,
  222,
  223,
  224,
  225,
  226,
  227,
  228,
  229,
  230,
  231,
  232,
  233,
  234,
  235,
  236,
  237,
  238,
  239,
  240,
  241,
  242,
  243,
  244,
  245,
  246,
  247,
  248,
  249,
  250,
  251,
  252,
  253,
  254,
  255,
]);

export default class RC4 {
  public key: string;
  public mState: number[];
  private keyBytes: Buffer;
  private keyLen: number;
  private mX: number;
  private mY: number;

  // constructor() {
  //   this.mState = initialState;
  // }

  public setEncryptionKey(key: Buffer) {
    this.key = key.toString("hex");
    this.keyBytes = key;
    this.keyLen = this.keyBytes.length;
    this.mState = Array(256);
    this.mX = 0;
    this.mY = 0;

    for (let counter = 0; counter < 256; counter++) {
      this.mState[counter] = counter;
    }

    let index1 = 0;
    let j = 0;

    for (let counter = 0; counter < 256; counter++) {
      j = (j + this.mState[counter] + this.keyBytes[index1++]) % 256;
      this.swapByte(counter, j);
      if (index1 >= this.keyLen) {
        index1 = 0;
      }
    }
  }

  public processBuffer(inBytes: Buffer) {
    let idx1 = 0;
    let idx2 = 0;
    let length = inBytes.length;
    const output = Buffer.alloc(length);
    const s = this.mState;
    let x = this.mX;
    let y = this.mY;

    while (length--) {
      // tslint:disable-next-line no-bitwise
      x = (x + 1) & 0xff;
      const a = s[x];
      // tslint:disable-next-line no-bitwise
      y = (y + a) & 0xff;
      this.swapByte(x, y);

      // tslint:disable-next-line no-bitwise
      output[idx1++] = inBytes[idx2++] ^ s[(s[y] + s[x]) & 0xff];
    }

    this.mX = x;
    this.mY = y;
    return output;
  }

  public processString(inBytes: Buffer) {
    let i = 0;
    let j = 0;
    const length = inBytes.length;
    const output = Buffer.alloc(length);

    for (let index = 0; index < length; ++index) {
      i = (i + 1) % 256;
      j = (j + this.mState[i]) % 256;
      this.swapByte(i, j);
      output[index] =
        // tslint:disable-next-line:no-bitwise
        inBytes[index] ^ this.mState[(this.mState[i] + this.mState[j]) % 256];
    }
    // this._genState();
    return output;
  }

  // private _resetState() {
  //   this.mState = Buffer.from(initialState);
  // }

  // private _genState() {
  //   this._resetState();

  //   let j = 0;

  //   const state = this.mState;
  //   const len = this.key.length;
  //   for (let i = 0; i < 256; ++i) {
  //     j = (j + state[i] + this.key[i % len]) % 256;
  //     state[j] = [state[i], (state[i] = state[j])][0];
  //   }
  //   return state;
  // }

  private swapByte(b1: number, b2: number) {
    const t1 = this.mState[b1];
    this.mState[b1] = this.mState[b2];
    this.mState[b2] = t1;
  }
}
