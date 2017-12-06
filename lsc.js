const { exec } = require("child_process");
const crypto = require("crypto");
const RC4 = require("./src/RC4.js");

// exec("openssl list-cipher-algorithms", (error, stdout, stderr) => {
//   if (error) {
//     console.error(`exec error: ${error}`);
//     return;
//   }

//   const ciphers = stdout.split("\n");
//   console.log(`stdout: ${ciphers}`);
// });

const key1 = Buffer.from("Secret");
const key2 = Buffer.from("c4ce5570c1078107", "hex");
const key3 = Buffer.from("bed0e1ad2685c811", "hex");
const plainText1 = Buffer.from("Attack at dawn");
const cipherText2 = Buffer.from("b39837bff7d64ab2d13ca33cb8b1504f27a18c8b4039e3bd4b16f033717c5ad83aeced6a1430a7", "hex");
const cipherText3 = Buffer.from("bfa5c602e71ec561aaeb3b5ae3dee0ae60e55dde3026e8afc1a48f7d5b5122f1fcbbd3bfa76586", "hex");

console.log(plainText1, " = ", new RC4.ARC4(key1, key1.length).EncodeString(plainText1));
console.log("----------------------------------------------------");
console.log(cipherText2, " = ", new RC4.ARC4(key2).DecodeString(cipherText2));
console.log("----------------------------------------------------");
console.log(cipherText3, " = ", new RC4.ARC4(key3).DecodeString(cipherText3));
console.log("----------------------------------------------------");

