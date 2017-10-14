const castanetResponse = {
  headers: "'Content-Type', 'application/octet-stream'",
  body: new Buffer("cafebeef00000000000003", "hex")
};

function patchUpdateInfo() {
  return castanetResponse;
}

function patchNPS() {
  return castanetResponse;
}

function patchMCO() {
  return castanetResponse;
}

module.exports = {
  patchMCO,
  patchNPS,
  patchUpdateInfo
};
