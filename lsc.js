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

const key1 = "c4ce5570c1078107";
const key2 = "bed0e1ad2685c811";
const cipherText1 = "b39837bff7d64ab2d13ca33cb8b1504f27a18c8b4039e3bd4b16f033717c5ad83aeced6a1430a7";
const cipherText2 = Buffer.from([
  0xbf,
  0xa5,
  0xc6,
  0x02,
  0xe7,
  0x1e,
  0xc5,
  0x61,
  0xaa,
  0xeb,
  0x3b,
  0x5a,
  0xe3,
  0xde,
  0xe0,
  0xae,
  0x60,
  0xe5,
  0x5d,
  0xde,
  0x30,
  0x26,
  0xe8,
  0xaf,
  0xc1,
  0xa4,
  0x8f,
  0x7d,
  0x5b,
  0x51,
  0x22,
  0xf1,
  0xfc,
  0xbb,
  0xd3,
  0xbf,
  0xa7,
  0x65,
  0x86,
]);

var cipher1 = RC4(key1);
var cipher2 = RC4(key2);

// var cipher3 = RC4.RC4(key1);
// var cipher4 = RC4.RC4(key2);

console.log(cipherText1, " = ", cipher1.decodeBuffer(cipherText1));

console.log(cipherText2, " = ", cipher2.decodeBuffer(cipherText2));

// console.log(cipherText1, " = ", cipher3.ProcessString(cipherText1, 48));

// console.log(cipherText2, " = ", cipher4.ProcessString(cipherText2, 48));
