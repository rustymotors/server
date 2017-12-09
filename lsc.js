const { exec } = require("child_process");
const crypto = require("crypto");
const RC4 = require("./src/RC4.js");

exec("openssl list-cipher-algorithms", (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }

  const ciphers = stdout.split("\n");
  console.log(`stdout: ${stdout}`);

  // Start
  const key2 = Buffer.from("c4ce5570c10781071fd5416cc446b1106e59177db5ccdb92ac048f6ed601a8e7", "hex");
  const cipherText2 = Buffer.from("b39837bff7d64ab2d13ca33cb8b1504f27a18c8b4039e3bd4b16f033717c5ad83aeced6a1430a7", "hex");
  
  console.log(plainText1, " = ", new RC4.ARC4(key1, key1.length).EncodeString(plainText1, plainText1.length));
  console.log("----------------------------------------------------");
  console.log(cipherText2, " = ", new RC4.ARC4(key2).DecodeString(cipherText2, cipherText2.length));
  console.log("----------------------------------------------------");
  console.log(cipherText3, " = ", new RC4.ARC4(key3).DecodeString(cipherText3, cipherText3.length));
  console.log("----------------------------------------------------");
  console.log(cipherText4, " = ", new RC4.ARC4(key1).DecodeString(cipherText4, cipherText4.length).toString());
  
});

