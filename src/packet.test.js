const packet = require("./packet.js");

test("retuns a buffer packet from premadeLogin", () => {
  expect(packet.premadeLogin()).toBeInstanceOf(Buffer);
});

test("retuns a buffer packet from craftGenericReply", () => {
  expect(packet.craftGenericReply()).toBeInstanceOf(Buffer);
});

test("retuns a buffer packet from premadePersonaMaps", () => {
  expect(packet.premadePersonaMaps()).toBeInstanceOf(Buffer);
});

test("retuns a buffer packet from buildPacket", () => {
  expect(
    packet.buildPacket(6, 0x601, new Buffer.from([0x06, 0x01]))
  ).toBeInstanceOf(Buffer);
});
