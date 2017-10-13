const castanetResponse = {
  headers: "'Content-Type', 'application/octet-stream'",
  body: new Buffer("cafebeef00000000000003", "hex")
};

function patchUpdateInfo() {
  return castanetRespons;
}

function patchNPS() {
  return castanetRespons;
}

function patchMCO() {
  return castanetRespons;
}

module.exports = {
  patchMCO,
  patchNPS,
  patchUpdateInfo
};
