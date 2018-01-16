const { exec } = require("child_process");
const crypto = require("crypto");
const RC4 = require("./src/RC4.js");

// Start
const k1 = Buffer.from("Secret");
const p1 = Buffer.from("Attack at dawn");
const c1 = Buffer.from("45A01F645FC35B383552544B9BF5", "hex");

console.log(p1, " = ", new RC4.ARC4(k1, k1.length).EncodeString(p1, p1.length));

console.log(
  c1,
  " = ",
  new RC4.ARC4(k1, k1.length).DecodeString(c1, c1.length).toString()
);
